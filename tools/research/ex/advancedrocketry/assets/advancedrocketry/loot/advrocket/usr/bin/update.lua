-- Offline, transactional updater for the AdvRocket OpenOS program suite.
-- The authoritative update source is the read-only AdvRocket program disk.

local component = require("component")
local computer = require("computer")
local filesystem = require("filesystem")

local PACKAGE_ID = "advancedRocketry:advrocket"
local FORMAT_VERSION = 1
local INSTALLED_MANIFEST = "/usr/lib/advrocket/manifest.lua"
local MANIFEST_RELATIVE = "usr/lib/advrocket/manifest.lua"
local STAGING_PREFIX = "/usr/lib/advrocket/.update-staging-"
local ROLLBACK_PREFIX = "/usr/lib/advrocket/.update-rollback-"
local CHUNK_SIZE = 4096

local function cleanText(value)
  return tostring(value or ""):gsub("[%c]", "?")
end

local function fail(message)
  error(cleanText(message), 0)
end

local function sameDevice(first, second)
  return first and second and first.address and second.address
    and first.address == second.address
end

local function join(base, relative)
  return filesystem.concat(base, relative)
end

local function pathHasLink(base, relative)
  local current = base
  for segment in relative:gmatch("[^/]+") do
    current = filesystem.concat(current, segment)
    local called, isLink = pcall(filesystem.isLink, current)
    if called and isLink == true then
      return true, current
    end
  end
  return false
end

local function validateRelativePath(path)
  if type(path) ~= "string" or path == "" then
    return false, "manifest contains an empty or non-string path"
  end
  if path:sub(1, 1) == "/" or path:find("\\", 1, true) then
    return false, "path must be relative: " .. cleanText(path)
  end
  if path:find("//", 1, true) then
    return false, "path is not canonical: " .. cleanText(path)
  end
  for segment in path:gmatch("[^/]+") do
    if segment == "." or segment == ".." then
      return false, "path traversal is not allowed: " .. cleanText(path)
    end
  end
  if filesystem.canonical(path) ~= path then
    return false, "path is not canonical: " .. cleanText(path)
  end
  local allowed = path == "usr/bin/advrocket.lua"
    or path == "usr/bin/update.lua"
    or path:sub(1, #"usr/lib/advrocket/") == "usr/lib/advrocket/"
  if not allowed then
    return false, "path is outside the AdvRocket package: " ..
      cleanText(path)
  end
  if path:sub(1, #"usr/lib/advrocket/.update-") ==
      "usr/lib/advrocket/.update-" then
    return false, "manifest path uses a reserved updater prefix"
  end
  return true
end

local function loadManifest(path, base, relative)
  if not filesystem.exists(path) or filesystem.isDirectory(path) then
    return nil, "manifest not found"
  end
  local linked, linkedPath = pathHasLink(base, relative)
  if linked then
    return nil, "manifest traverses a symbolic link: " .. linkedPath
  end
  -- Manifests are source-controlled Lua data files. Refuse binary chunks so
  -- a writable installed manifest cannot smuggle precompiled bytecode into
  -- the update process.
  local chunk, reason = loadfile(path, "t", {})
  if not chunk then
    return nil, "cannot load manifest: " .. cleanText(reason)
  end
  local called, manifest = pcall(chunk)
  if not called then
    return nil, "manifest execution failed: " .. cleanText(manifest)
  end
  if type(manifest) ~= "table" then
    return nil, "manifest did not return a table"
  end
  return manifest
end

local function validateManifest(manifest, installedManifest,
    validatingInstalled)
  if manifest.packageId ~= PACKAGE_ID then
    return nil, "wrong packageId"
  end
  if manifest.formatVersion ~= FORMAT_VERSION then
    return nil, "unsupported manifest formatVersion"
  end
  if type(manifest.modVersion) ~= "string" or manifest.modVersion == "" then
    return nil, "manifest has no modVersion"
  end
  if type(manifest.files) ~= "table" or #manifest.files == 0 then
    return nil, "manifest has no managed files"
  end

  local files = {}
  local fileSet = {}
  local includesManifest = false
  for _, path in ipairs(manifest.files) do
    local valid, reason = validateRelativePath(path)
    if not valid then
      return nil, reason
    end
    if fileSet[path] then
      return nil, "duplicate managed path: " .. path
    end
    fileSet[path] = true
    files[#files + 1] = path
    includesManifest = includesManifest or path == MANIFEST_RELATIVE
  end
  if not includesManifest then
    return nil, "manifest does not manage itself"
  end

  local oldSet = {}
  if installedManifest and type(installedManifest.files) == "table" then
    for _, path in ipairs(installedManifest.files) do
      if type(path) == "string" then
        oldSet[path] = true
      end
    end
  end

  local remove = {}
  local removeSet = {}
  if manifest.remove ~= nil and type(manifest.remove) ~= "table" then
    return nil, "manifest remove field is not a table"
  end
  for _, path in ipairs(manifest.remove or {}) do
    local valid, reason = validateRelativePath(path)
    if not valid then
      return nil, reason
    end
    if removeSet[path] or fileSet[path] then
      return nil, "duplicate or conflicting remove path: " .. path
    end
    if not validatingInstalled and not oldSet[path] then
      return nil, "remove path was not managed by the installed package: " ..
        path
    end
    removeSet[path] = true
    remove[#remove + 1] = path
  end
  return {files = files, fileSet = fileSet, remove = remove}
end

local function discoverSource()
  local rootDevice = filesystem.get("/")
  local tmpAddress = computer.tmpAddress()
  local filesystemComponents = component.list("filesystem")
  local seen = {}
  local matches = {}

  for device, mountPath in filesystem.mounts() do
    local address = device.address
    local isComponent = address and filesystemComponents[address] ~= nil
    if isComponent and not seen[address]
        and not sameDevice(device, rootDevice)
        and address ~= tmpAddress then
      seen[address] = true
      local readOnlyOk, readOnly = pcall(device.isReadOnly)
      if readOnlyOk and readOnly == true then
        local manifestPath = join(mountPath, MANIFEST_RELATIVE)
        if filesystem.exists(manifestPath)
            and not filesystem.isDirectory(manifestPath) then
          local manifest, reason = loadManifest(manifestPath, mountPath,
            MANIFEST_RELATIVE)
          if manifest and manifest.packageId == PACKAGE_ID
              and manifest.formatVersion == FORMAT_VERSION then
            matches[#matches + 1] = {
              device = device,
              mountPath = mountPath,
              manifest = manifest
            }
          elseif manifest and manifest.packageId == PACKAGE_ID then
            fail("AdvRocket disk has an unsupported manifest: " ..
              cleanText(reason or manifest.formatVersion))
          end
        end
      end
    end
  end

  if #matches == 0 then
    fail("Insert the AdvRocket program disk and run update again")
  elseif #matches > 1 then
    fail("Multiple AdvRocket program disks are mounted; leave exactly one")
  end
  return matches[1]
end

local function ensureDirectory(path)
  if filesystem.exists(path) then
    if not filesystem.isDirectory(path) then
      fail("expected a directory: " .. path)
    end
    return
  end
  local ok, reason = filesystem.makeDirectory(path)
  if not ok then
    fail("cannot create directory " .. path .. ": " .. cleanText(reason))
  end
end

local function ensureParent(path)
  local parent = filesystem.path(path)
  if parent and parent ~= "" then
    ensureDirectory(parent)
  end
end

local function closeQuietly(handle)
  if handle then
    pcall(handle.close, handle)
  end
end

local function copyFile(source, target)
  ensureParent(target)
  local input, inputReason = filesystem.open(source, "rb")
  if not input then
    fail("cannot read " .. source .. ": " .. cleanText(inputReason))
  end
  local output, outputReason = filesystem.open(target, "wb")
  if not output then
    closeQuietly(input)
    fail("cannot write " .. target .. ": " .. cleanText(outputReason))
  end

  local ok, reason = xpcall(function()
    while true do
      local chunk, readReason = input:read(CHUNK_SIZE)
      if chunk == nil then
        if readReason then
          fail("read failed for " .. source .. ": " .. cleanText(readReason))
        end
        break
      end
      local wrote, writeReason = output:write(chunk)
      if wrote == nil or wrote == false then
        fail("write failed for " .. target .. ": " ..
          cleanText(writeReason))
      end
      os.sleep(0)
    end
  end, tostring)
  closeQuietly(input)
  closeQuietly(output)
  if not ok then
    fail(reason)
  end

  local sourceSize = filesystem.size(source)
  local targetSize = filesystem.size(target)
  if type(sourceSize) ~= "number" or sourceSize ~= targetSize then
    fail("size verification failed for " .. source)
  end
end

local function removeTree(path)
  if not filesystem.exists(path) then
    return true
  end
  if filesystem.isDirectory(path) then
    for name in filesystem.list(path) do
      local ok, reason = removeTree(filesystem.concat(path, name))
      if not ok then
        return false, reason
      end
    end
  end
  return filesystem.remove(path)
end

local function moveFile(source, target)
  ensureParent(target)
  local ok, reason = filesystem.rename(source, target)
  if not ok then
    fail("cannot move " .. source .. " to " .. target .. ": " ..
      cleanText(reason))
  end
end

local function uniqueTemporaryRoots()
  local suffix = tostring(math.floor(computer.uptime() * 1000))
  local attempt = 0
  while true do
    local extra = attempt == 0 and suffix or (suffix .. "-" .. attempt)
    local staging = STAGING_PREFIX .. extra
    local rollback = ROLLBACK_PREFIX .. extra
    if not filesystem.exists(staging) and not filesystem.exists(rollback) then
      return staging, rollback
    end
    attempt = attempt + 1
  end
end

local function ensureLocalDestination(rootDevice, relative)
  local target = "/" .. relative
  local linked, linkedPath = pathHasLink("/", relative)
  if linked then
    fail("target traverses a symbolic link: " .. linkedPath)
  end
  if filesystem.exists(target) and filesystem.isDirectory(target) then
    fail("managed file path is a directory: " .. target)
  end
  local parent = filesystem.path(target) or "/"
  local targetDevice = filesystem.get(parent)
  if not sameDevice(rootDevice, targetDevice) then
    fail("managed path crosses a mounted filesystem: " .. target)
  end
  return target
end

local function run()
  local rootDevice = filesystem.get("/")
  if not rootDevice then
    fail("OpenOS has no root filesystem")
  end
  local readOnlyOk, rootReadOnly = pcall(rootDevice.isReadOnly)
  if not readOnlyOk or rootReadOnly then
    fail("OpenOS root filesystem is read-only")
  end

  if not filesystem.exists(INSTALLED_MANIFEST) then
    fail("AdvRocket is not installed; run install AdvRocket first")
  end
  local installedManifest, installedReason = loadManifest(
    INSTALLED_MANIFEST, "/", MANIFEST_RELATIVE)
  if not installedManifest then
    fail("Installed AdvRocket manifest is invalid: " .. installedReason)
  end
  local installedValidated, installedValidationReason =
    validateManifest(installedManifest, nil, true)
  if not installedValidated then
    fail("Installed AdvRocket manifest is invalid: " ..
      installedValidationReason)
  end

  local source = discoverSource()
  local validated, validationReason = validateManifest(source.manifest,
    installedManifest)
  if not validated then
    fail("AdvRocket disk manifest is invalid: " .. validationReason)
  end

  if source.manifest.modVersion == installedManifest.modVersion then
    print("AdvRocket " .. source.manifest.modVersion ..
      " is already up to date")
    return 0
  end

  for _, relative in ipairs(validated.files) do
    local sourcePath = join(source.mountPath, relative)
    if not filesystem.exists(sourcePath)
        or filesystem.isDirectory(sourcePath) then
      fail("AdvRocket disk is missing managed file: " .. relative)
    end
    local linked, linkedPath = pathHasLink(source.mountPath, relative)
    if linked then
      fail("source file traverses a symbolic link: " .. linkedPath)
    end
    ensureLocalDestination(rootDevice, relative)
  end
  for _, relative in ipairs(validated.remove) do
    ensureLocalDestination(rootDevice, relative)
  end

  local stagingRoot, rollbackRoot = uniqueTemporaryRoots()
  ensureDirectory(stagingRoot)
  ensureDirectory(rollbackRoot)

  local transactionStarted = false
  local movedOld = {}
  local installedNew = {}
  local transactionOk, transactionReason = xpcall(function()
    for _, relative in ipairs(validated.files) do
      copyFile(join(source.mountPath, relative),
        join(stagingRoot, relative))
    end

    transactionStarted = true
    local candidates = {}
    local candidateSet = {}
    for _, relative in ipairs(validated.files) do
      candidates[#candidates + 1] = relative
      candidateSet[relative] = true
    end
    for _, relative in ipairs(validated.remove) do
      if not candidateSet[relative] then
        candidates[#candidates + 1] = relative
      end
    end

    for _, relative in ipairs(candidates) do
      local finalPath = "/" .. relative
      if filesystem.exists(finalPath) then
        local backupPath = join(rollbackRoot, relative)
        moveFile(finalPath, backupPath)
        movedOld[#movedOld + 1] = {
          finalPath = finalPath,
          backupPath = backupPath
        }
      end
    end

    -- Install the package manifest last, so an interrupted update never
    -- advertises a version whose managed files were not all committed.
    for _, relative in ipairs(validated.files) do
      if relative ~= MANIFEST_RELATIVE then
        local finalPath = "/" .. relative
        moveFile(join(stagingRoot, relative), finalPath)
        installedNew[#installedNew + 1] = finalPath
      end
    end
    local finalManifest = "/" .. MANIFEST_RELATIVE
    moveFile(join(stagingRoot, MANIFEST_RELATIVE), finalManifest)
    installedNew[#installedNew + 1] = finalManifest
  end, tostring)

  if not transactionOk then
    local rollbackErrors = {}
    if transactionStarted then
      for index = #installedNew, 1, -1 do
        local path = installedNew[index]
        if filesystem.exists(path) then
          local removed, reason = filesystem.remove(path)
          if not removed then
            rollbackErrors[#rollbackErrors + 1] = cleanText(reason)
          end
        end
      end
      for index = #movedOld, 1, -1 do
        local entry = movedOld[index]
        if filesystem.exists(entry.backupPath) then
          local restored, reason = filesystem.rename(entry.backupPath,
            entry.finalPath)
          if not restored then
            rollbackErrors[#rollbackErrors + 1] = cleanText(reason)
          end
        end
      end
    end
    removeTree(stagingRoot)
    if #rollbackErrors == 0 then
      removeTree(rollbackRoot)
      fail("AdvRocket update failed and was rolled back: " ..
        cleanText(transactionReason))
    end
    fail("AdvRocket update failed; rollback needs manual recovery from " ..
      rollbackRoot .. ": " .. table.concat(rollbackErrors, "; "))
  end

  local stagingRemoved, stagingReason = removeTree(stagingRoot)
  local rollbackRemoved, rollbackReason = removeTree(rollbackRoot)
  if not stagingRemoved or not rollbackRemoved then
    io.stderr:write("Warning: update succeeded but temporary cleanup failed: " ..
      cleanText(stagingReason or rollbackReason) .. "\n")
  end
  print("AdvRocket updated from " .. installedManifest.modVersion ..
    " to " .. source.manifest.modVersion)
  return 0
end

local ok, result = xpcall(run, tostring)
if not ok then
  io.stderr:write("update: " .. cleanText(result) .. "\n")
  return 1
end
return result or 0
