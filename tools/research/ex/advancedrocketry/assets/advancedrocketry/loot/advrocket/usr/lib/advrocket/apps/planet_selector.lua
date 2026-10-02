-- AdvancedRocketry Continuation Holographic Planet Selector GUI for OpenOS.
-- Minecraft 1.7.10 / OpenComputers 1.12.44-GTNH.

local component = require("component")
local computer = require("computer")
local event = require("event")

local APP_NAME = "Advanced Rocketry Planet Selector"
local APP_VERSION = "1.0.0"
local REFRESH_SECONDS = 1
local MIN_TARGET_ID = -2147483648
local MAX_TARGET_ID = 2147483647
local MIN_SCALE = 0.8
local MAX_SCALE = 10.8

local colors = {
  background = 0x101820,
  panel = 0x1B2A36,
  panelActive = 0x28506B,
  text = 0xE8F1F5,
  muted = 0x8EA7B3,
  accent = 0x53C7F0,
  good = 0x63D471,
  warning = 0xF2C14E,
  bad = 0xF25F5C,
  button = 0x2C4454,
  buttonDisabled = 0x26323A,
  buttonText = 0xFFFFFF
}

local selector = {
  componentName = "planet_selector",
  label = "Holographic Planet Selector"
}

local tabs = {"Overview", "Target", "Scale"}
local selectedTab = 1
local snapshot = nil
local snapshotStale = false
local currentInfo = nil
local currentInfoId = nil
local currentInfoError = nil
local destinationInfo = nil
local destinationInfoId = nil
local destinationInfoError = nil
local draftInfo = nil
local draftInfoId = nil
local draftInfoError = nil
local buttons = {}

local targetDraft = nil
local targetDirty = false
local targetEditing = false
local targetBuffer = ""
local replaceEditOnType = false
local scaleDraft = nil
local scaleDirty = false

local statusText = "Starting..."
local statusColor = colors.muted
local statusExpiresAt = 0
local running = true

local gpu
local width
local height
local oldWidth
local oldHeight
local oldForeground
local oldForegroundPalette
local oldBackground
local oldBackgroundPalette

local function clamp(value, minimum, maximum)
  return math.max(minimum, math.min(maximum, value))
end

local function quantizeScale(value)
  return clamp(math.floor(value * 10 + 0.5) / 10, MIN_SCALE, MAX_SCALE)
end

local function cleanText(value)
  return tostring(value or ""):gsub("[%c]", "?")
end

local function shortAddress(address)
  if type(address) ~= "string" then
    return "--------"
  end
  return string.sub(address, 1, 8)
end

local function formatInteger(value)
  if type(value) ~= "number" then
    return "--"
  end
  return string.format("%.0f", value)
end

local function formatScale(value)
  if type(value) ~= "number" then
    return "--"
  end
  return string.format("%.1f", value)
end

local function yesNo(value)
  if value == true then
    return "YES"
  elseif value == false then
    return "NO"
  end
  return "--"
end

local function setColors(foreground, background)
  gpu.setForeground(foreground)
  gpu.setBackground(background)
end

local function clearLine(y, background)
  gpu.setBackground(background or colors.background)
  gpu.fill(1, y, width, 1, " ")
end

local function writeAt(x, y, value, foreground, background, maximumLength)
  local text = cleanText(value)
  if maximumLength and #text > maximumLength then
    if maximumLength >= 4 then
      text = string.sub(text, 1, maximumLength - 3) .. "..."
    else
      text = string.sub(text, 1, maximumLength)
    end
  end
  if x > width or y < 1 or y > height then
    return
  end
  if x < 1 then
    text = string.sub(text, 2 - x)
    x = 1
  end
  if x + #text - 1 > width then
    text = string.sub(text, 1, width - x + 1)
  end
  if #text == 0 then
    return
  end
  setColors(foreground or colors.text, background or colors.background)
  gpu.set(x, y, text)
end

local function writeCentered(y, value, foreground, background)
  local text = cleanText(value)
  if #text > width then
    text = string.sub(text, 1, width)
  end
  writeAt(math.floor((width - #text) / 2) + 1, y, text,
    foreground, background)
end

local function setStatus(message, color, duration)
  statusText = cleanText(message)
  statusColor = color or colors.text
  statusExpiresAt = computer.uptime() + (duration or 5)
end

local function isMissingMethod(code, message)
  local combined = string.lower(tostring(code or "") .. " " ..
    tostring(message or ""))
  return string.find(combined, "no such method", 1, true) ~= nil
    or string.find(combined, "unknown method", 1, true) ~= nil
    or string.find(combined, "method unavailable", 1, true) ~= nil
    or string.find(combined, "not available", 1, true) ~= nil
end

local function clearInfoCaches()
  currentInfo = nil
  currentInfoId = nil
  currentInfoError = nil
  destinationInfo = nil
  destinationInfoId = nil
  destinationInfoError = nil
  draftInfo = nil
  draftInfoId = nil
  draftInfoError = nil
end

local function cancelTargetEdit(showMessage)
  if not targetEditing then
    return
  end
  targetEditing = false
  targetBuffer = ""
  replaceEditOnType = false
  if showMessage then
    setStatus("Target ID edit cancelled", colors.warning)
  end
end

local function disconnectSelector(message)
  selector.address = nil
  selector.proxy = nil
  selector.error = message
  snapshot = nil
  snapshotStale = false
  clearInfoCaches()
  targetDraft = nil
  targetDirty = false
  scaleDraft = nil
  scaleDirty = false
  cancelTargetEdit(false)
end

local function handleCallError(code, message)
  if tostring(code) == "invalid_tile" then
    disconnectSelector(tostring(code) .. ": " .. tostring(message))
  end
end

local function invokeGetter(method, ...)
  if not selector.proxy or not selector.address then
    return false, "not_connected", "Planet Selector is not connected"
  end
  local invoked, first, second, third = pcall(
    component.invoke, selector.address, method, ...)
  if not invoked then
    local reason = tostring(first)
    if isMissingMethod("", reason) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if first == nil then
    local code = tostring(second or "unknown_error")
    local message = tostring(third or "Planet Selector call failed")
    if isMissingMethod(code, message) then
      code = "missing_method"
      message = method .. " is not available"
    end
    handleCallError(code, message)
    return false, code, message
  end
  return true, first, second, third
end

local function invokeMutator(method, ...)
  if not selector.proxy or not selector.address then
    return false, "not_connected", "Planet Selector is not connected"
  end
  local invoked, success, valueOrCode, message = pcall(
    component.invoke, selector.address, method, ...)
  if not invoked then
    local reason = tostring(success)
    if isMissingMethod("", reason) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if success ~= true then
    local code = tostring(valueOrCode or "unknown_error")
    local detail = tostring(message or "Planet Selector operation failed")
    handleCallError(code, detail)
    return false, code, detail
  end
  return true, valueOrCode, message
end

local function findSelector()
  local ok, addressOrError = pcall(function()
    local iterator = component.list(selector.componentName, true)
    return iterator()
  end)
  if not ok or not addressOrError then
    disconnectSelector(ok and "not connected" or tostring(addressOrError))
    return false
  end
  local proxyOk, proxyOrError = pcall(component.proxy, addressOrError)
  if not proxyOk then
    disconnectSelector(tostring(proxyOrError))
    return false
  end
  selector.address = addressOrError
  selector.proxy = proxyOrError
  selector.error = nil
  return true
end

local function getFallbackSnapshot()
  local destinationOk, destinationOrCode, destinationMessage =
    invokeGetter("getDestination")
  if not destinationOk then
    return false, destinationOrCode, destinationMessage
  end
  local scaleOk, scaleOrCode, scaleMessage = invokeGetter("getScale")
  if not scaleOk then
    return false, scaleOrCode, scaleMessage
  end
  local enabledOk, enabledOrCode, enabledMessage = invokeGetter("isEnabled")
  if not enabledOk then
    return false, enabledOrCode, enabledMessage
  end
  local currentOk, currentOrCode, currentMessage =
    invokeGetter("getCurrentPlanet")
  local inWarp = not currentOk and tostring(currentOrCode) == "in_warp"
  if not currentOk and not inWarp then
    return false, currentOrCode, currentMessage
  end
  return true, {
    stationId = nil,
    currentTargetId = currentOk and currentOrCode or nil,
    destinationTargetId = destinationOrCode,
    scale = scaleOrCode,
    enabled = enabledOrCode == true,
    inWarp = inWarp
  }
end

local function getSnapshot()
  local ok, valueOrCode, message = invokeGetter("getStatus")
  if ok then
    if type(valueOrCode) ~= "table" then
      return false, "invalid_response", "getStatus did not return a table"
    end
    return true, valueOrCode
  end
  if valueOrCode ~= "missing_method" then
    return false, valueOrCode, message
  end
  return getFallbackSnapshot()
end

local function readTargetInfo(id)
  if type(id) ~= "number" then
    return nil, "invalid_target"
  end
  local ok, valueOrCode, message = invokeGetter("getTargetInfo", id)
  if not ok then
    return nil, tostring(valueOrCode) .. ": " .. tostring(message)
  end
  if type(valueOrCode) ~= "table" then
    return nil, "invalid_response: target info is not a table"
  end
  return valueOrCode, nil
end

local function refreshInfoCaches(force)
  if not snapshot then
    clearInfoCaches()
    return
  end
  local currentId = snapshot.currentTargetId
  if snapshot.inWarp then
    currentInfo = nil
    currentInfoId = currentId
    currentInfoError = "in_warp"
  elseif force or currentInfoId ~= currentId then
    currentInfo, currentInfoError = readTargetInfo(currentId)
    currentInfoId = currentId
  end

  local destinationId = snapshot.destinationTargetId
  if force or destinationInfoId ~= destinationId then
    destinationInfo, destinationInfoError = readTargetInfo(destinationId)
    destinationInfoId = destinationId
  end

  if not targetDirty and not targetEditing then
    targetDraft = destinationId
  end
  if force or draftInfoId ~= targetDraft then
    draftInfo, draftInfoError = readTargetInfo(targetDraft)
    draftInfoId = targetDraft
  end
end

local function refreshSnapshot(showErrors, forceInfo)
  if not selector.proxy then
    snapshot = nil
    snapshotStale = false
    return false
  end
  local ok, valueOrCode, message = getSnapshot()
  if not ok then
    selector.error = tostring(valueOrCode) .. ": " .. tostring(message)
    snapshotStale = snapshot ~= nil
    if showErrors then
      setStatus("Status refresh failed - " .. selector.error, colors.bad, 8)
    end
    return false
  end
  snapshot = valueOrCode
  snapshotStale = false
  selector.error = nil
  if not scaleDirty then
    scaleDraft = snapshot.scale
  end
  refreshInfoCaches(forceInfo == true)
  return true
end

local function reconnect(showMessage)
  cancelTargetEdit(false)
  local found = findSelector()
  if found then
    refreshSnapshot(false, true)
  end
  if showMessage then
    if found then
      setStatus("Planet Selector connected [" .. shortAddress(selector.address) ..
        "]", colors.good)
    else
      setStatus("Planet Selector not found", colors.warning, 7)
    end
  end
end

local function updateDraftInfo()
  draftInfo, draftInfoError = readTargetInfo(targetDraft)
  draftInfoId = targetDraft
end

local function setTargetDraft(value)
  if targetEditing then
    return
  end
  local base = type(targetDraft) == "number" and targetDraft
    or snapshot and snapshot.destinationTargetId or 0
  targetDraft = clamp(math.floor(value or base), MIN_TARGET_ID, MAX_TARGET_ID)
  targetDirty = not snapshot or targetDraft ~= snapshot.destinationTargetId
  updateDraftInfo()
end

local function adjustTarget(amount)
  local base = type(targetDraft) == "number" and targetDraft
    or snapshot and snapshot.destinationTargetId or 0
  setTargetDraft(base + amount)
end

local function beginTargetEdit()
  targetEditing = true
  targetBuffer = type(targetDraft) == "number" and formatInteger(targetDraft)
    or ""
  replaceEditOnType = true
  setStatus("Editing target ID - type an integer, then press Enter",
    colors.accent, 30)
end

local function parseTargetBuffer()
  if targetBuffer == "" or targetBuffer == "-" then
    return nil
  end
  local value = tonumber(targetBuffer)
  if not value or value ~= math.floor(value) then
    return nil
  end
  return clamp(value, MIN_TARGET_ID, MAX_TARGET_ID)
end

local function saveTargetEdit()
  local value = parseTargetBuffer()
  if value == nil then
    setStatus("Enter a valid integer target ID", colors.bad, 7)
    return false
  end
  targetEditing = false
  targetBuffer = ""
  replaceEditOnType = false
  targetDraft = value
  targetDirty = not snapshot or value ~= snapshot.destinationTargetId
  updateDraftInfo()
  setStatus("Target preview updated - press SELECT to commit", colors.accent)
  return true
end

local function syncTarget(showMessage)
  cancelTargetEdit(false)
  targetDraft = snapshot and snapshot.destinationTargetId or nil
  targetDirty = false
  updateDraftInfo()
  if showMessage then
    setStatus("Target draft synchronized", colors.good)
  end
end

local function applyTarget()
  if targetEditing then
    setStatus("Finish editing before selecting a target", colors.warning)
    return
  end
  if type(targetDraft) ~= "number" or not draftInfo then
    setStatus("Target cannot be resolved - " .. tostring(draftInfoError),
      colors.bad, 8)
    return
  end
  if not targetDirty then
    setStatus("Target draft already matches the committed destination",
      colors.muted)
    return
  end
  if draftInfo.known ~= true then
    setStatus("Target is not discovered by this station", colors.warning, 7)
    return
  end
  local ok, valueOrCode, message = invokeMutator("selectTarget", targetDraft)
  if not ok then
    setStatus("Target rejected - " .. tostring(valueOrCode) .. ": " ..
      tostring(message), colors.bad, 8)
    return
  end
  targetDraft = valueOrCode
  targetDirty = false
  refreshSnapshot(false, true)
  setStatus("Destination selected: " .. formatInteger(valueOrCode), colors.good)
end

local function adjustScale(amount)
  local base = type(scaleDraft) == "number" and scaleDraft
    or snapshot and snapshot.scale or 1.0
  scaleDraft = quantizeScale(base + amount)
  scaleDirty = not snapshot or math.abs(scaleDraft - snapshot.scale) > 0.0001
end

local function syncScale(showMessage)
  scaleDraft = snapshot and snapshot.scale or nil
  scaleDirty = false
  if showMessage then
    setStatus("Scale draft synchronized", colors.good)
  end
end

local function applyScale()
  if not scaleDirty then
    setStatus("Scale draft already matches the hologram", colors.muted)
    return
  end
  if type(scaleDraft) ~= "number" then
    setStatus("No valid scale draft", colors.bad)
    return
  end
  local ok, valueOrCode, message = invokeMutator("setScale", scaleDraft)
  if not ok then
    setStatus("Scale rejected - " .. tostring(valueOrCode) .. ": " ..
      tostring(message), colors.bad, 8)
    return
  end
  scaleDraft = valueOrCode
  scaleDirty = false
  refreshSnapshot(false, false)
  setStatus("Hologram scale set to " .. formatScale(valueOrCode), colors.good)
end

local function drawButton(x, y, buttonWidth, label, enabled, handler, active)
  if buttonWidth < 1 or x > width or y < 1 or y > height then
    return
  end
  buttonWidth = math.min(buttonWidth, width - x + 1)
  local text = cleanText(label)
  if #text > buttonWidth then
    text = string.sub(text, 1, buttonWidth)
  end
  local leftPadding = math.floor((buttonWidth - #text) / 2)
  local padded = string.rep(" ", leftPadding) .. text
  padded = padded .. string.rep(" ", buttonWidth - #padded)
  local background = active and colors.panelActive
    or enabled and colors.button or colors.buttonDisabled
  local foreground = enabled and colors.buttonText or colors.muted
  writeAt(x, y, padded, foreground, background, buttonWidth)
  buttons[#buttons + 1] = {
    x1 = x,
    x2 = x + buttonWidth - 1,
    y = y,
    enabled = enabled,
    handler = handler
  }
end

local function drawTabs()
  local baseWidth = math.floor(width / 3)
  drawButton(1, 3, baseWidth, tabs[1], true,
    function() cancelTargetEdit(false) selectedTab = 1 end, selectedTab == 1)
  drawButton(baseWidth + 1, 3, baseWidth, tabs[2], true,
    function() selectedTab = 2 end, selectedTab == 2)
  drawButton(baseWidth * 2 + 1, 3, width - baseWidth * 2, tabs[3], true,
    function() cancelTargetEdit(false) selectedTab = 3 end, selectedTab == 3)
end

local function drawPageHeader(label)
  clearLine(4, colors.panel)
  local suffix = snapshotStale and "  [STALE]" or ""
  writeAt(2, 4, label .. suffix,
    snapshotStale and colors.warning or colors.accent, colors.panel,
    width - 2)
end

local function drawUnavailable(title, detail, color)
  writeCentered(7, title, color or colors.warning)
  if detail then
    writeCentered(9, detail, colors.muted)
  end
end

local function targetName(info, fallbackId)
  if type(info) == "table" then
    return cleanText(info.name or ("Target " .. formatInteger(info.id)))
  end
  return "Target " .. formatInteger(fallbackId)
end

local function targetKind(info)
  if type(info) ~= "table" then
    return "--"
  end
  return cleanText(info.kind or "unknown"):gsub("_", " ")
end

local function drawOverview()
  drawPageHeader("HOLOGRAM STATUS")
  if not selector.proxy then
    drawUnavailable("Planet Selector: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Selector status unavailable", selector.error,
      colors.warning)
    return
  end

  writeAt(2, 5, "Station: " .. formatInteger(snapshot.stationId), colors.text)
  writeAt(math.floor(width / 2) + 1, 5,
    "Hologram: " .. (snapshot.enabled and "ENABLED" or "DISABLED"),
    snapshot.enabled and colors.good or colors.warning)
  writeAt(2, 6, "Scale: " .. formatScale(snapshot.scale) .. "x", colors.text)
  writeAt(math.floor(width / 2) + 1, 6,
    "Travel: " .. (snapshot.inWarp and "IN WARP" or "STATIONARY"),
    snapshot.inWarp and colors.accent or colors.muted)

  clearLine(8, colors.panel)
  writeAt(2, 8, "CURRENT ORBIT", colors.muted, colors.panel)
  writeAt(math.floor(width / 2) + 1, 8, "DESTINATION", colors.muted,
    colors.panel)
  local half = math.floor(width / 2)
  writeAt(2, 9, targetName(currentInfo, snapshot.currentTargetId),
    snapshot.inWarp and colors.warning or colors.text,
    colors.background, half - 2)
  writeAt(half + 1, 9,
    targetName(destinationInfo, snapshot.destinationTargetId), colors.text,
    colors.background, width - half)
  writeAt(2, 10, "ID " .. formatInteger(snapshot.currentTargetId) ..
    "  " .. targetKind(currentInfo), colors.muted,
    colors.background, half - 2)
  writeAt(half + 1, 10, "ID " .. formatInteger(snapshot.destinationTargetId) ..
    "  " .. targetKind(destinationInfo), colors.muted,
    colors.background, width - half)
  if currentInfoError and not snapshot.inWarp then
    writeAt(2, 12, "Current info: " .. currentInfoError, colors.warning,
      colors.background, width - 2)
  elseif destinationInfoError then
    writeAt(2, 12, "Destination info: " .. destinationInfoError,
      colors.warning, colors.background, width - 2)
  end
end

local function drawAdjustmentButtons(y, callback)
  local definitions = {{"-100", -100}, {"-10", -10}, {"-1", -1},
    {"+1", 1}, {"+10", 10}, {"+100", 100}}
  local buttonWidth = width >= 66 and 8 or 6
  local gap = 1
  local totalWidth = #definitions * buttonWidth + (#definitions - 1) * gap
  local x = math.floor((width - totalWidth) / 2) + 1
  for _, definition in ipairs(definitions) do
    local amount = definition[2]
    drawButton(x, y, buttonWidth, definition[1], not targetEditing,
      function() callback(amount) end)
    x = x + buttonWidth + gap
  end
end

local function drawTarget()
  drawPageHeader("DESTINATION SELECTION")
  if not selector.proxy then
    drawUnavailable("Planet Selector: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Target status unavailable", selector.error, colors.warning)
    return
  end

  local shownDraft = targetEditing and targetBuffer or formatInteger(targetDraft)
  clearLine(5, colors.panel)
  writeCentered(5, "TARGET ID  " .. shownDraft,
    targetEditing and colors.accent or targetDirty and colors.warning
      or colors.good, colors.panel)
  local previewColor = draftInfo and draftInfo.known and colors.good
    or draftInfo and colors.warning or colors.bad
  writeCentered(6, draftInfo and targetName(draftInfo, targetDraft)
    or "Unresolved target", previewColor)
  writeCentered(7, draftInfo and ("Type: " .. targetKind(draftInfo) ..
    "   Known: " .. yesNo(draftInfo.known) ..
    "   Current: " .. yesNo(draftInfo.current))
    or tostring(draftInfoError), colors.muted)

  drawAdjustmentButtons(9, adjustTarget)

  local editWidth, selectWidth, syncWidth = 12, 12, 12
  local totalWidth = editWidth + selectWidth + syncWidth + 2
  local x = math.floor((width - totalWidth) / 2) + 1
  drawButton(x, 11, editWidth, targetEditing and "SAVE ID" or "EDIT ID",
    true, targetEditing and saveTargetEdit or beginTargetEdit, targetEditing)
  local selectable = targetDirty and draftInfo ~= nil
    and draftInfo.known == true and draftInfo.current ~= true
  drawButton(x + editWidth + 1, 11, selectWidth, "SELECT", selectable,
    applyTarget)
  drawButton(x + editWidth + selectWidth + 2, 11, syncWidth, "SYNC",
    not targetEditing, function() syncTarget(true) end)

  writeCentered(13,
    "Selection changes the warp destination; it does not start a warp",
    colors.muted)
end

local function drawScale()
  drawPageHeader("HOLOGRAM SCALE")
  if not selector.proxy then
    drawUnavailable("Planet Selector: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Scale status unavailable", selector.error, colors.warning)
    return
  end

  writeCentered(6, "CURRENT SCALE  " .. formatScale(snapshot.scale) .. "x",
    colors.text)
  clearLine(8, colors.panel)
  writeCentered(8, "DRAFT SCALE  " .. formatScale(scaleDraft) .. "x",
    scaleDirty and colors.warning or colors.good, colors.panel)

  local buttonWidth = 10
  local labels = {{"-1.0", -1.0}, {"-0.1", -0.1},
    {"+0.1", 0.1}, {"+1.0", 1.0}}
  local total = #labels * buttonWidth + #labels - 1
  local x = math.floor((width - total) / 2) + 1
  for _, definition in ipairs(labels) do
    local amount = definition[2]
    drawButton(x, 10, buttonWidth, definition[1], true,
      function() adjustScale(amount) end)
    x = x + buttonWidth + 1
  end

  local applyWidth, syncWidth = 14, 14
  x = math.floor((width - applyWidth - syncWidth - 1) / 2) + 1
  drawButton(x, 12, applyWidth, "APPLY SCALE", scaleDirty, applyScale)
  drawButton(x + applyWidth + 1, 12, syncWidth, "SYNC", true,
    function() syncScale(true) end)
  writeCentered(14, "Valid range: 0.8x to 10.8x in 0.1x steps",
    colors.muted)
end

local function drawHeader()
  writeCentered(1, APP_NAME .. "  v" .. APP_VERSION, colors.accent)
  local state = selector.proxy and "ONLINE" or "OFFLINE"
  local stateColor = selector.proxy and colors.good or colors.bad
  if snapshot and snapshot.inWarp then
    state = "IN WARP"
    stateColor = colors.accent
  elseif snapshotStale then
    state = "STALE"
    stateColor = colors.warning
  end
  writeCentered(2, "Selector [" .. shortAddress(selector.address) .. "]  " ..
    state, stateColor)
end

local function drawStatusBar()
  if targetEditing then
    statusText = "Editing target ID - Enter saves the local draft"
    statusColor = colors.accent
  elseif statusExpiresAt > 0 and computer.uptime() >= statusExpiresAt then
    statusText = "Ready"
    statusColor = colors.muted
    statusExpiresAt = 0
  end
  clearLine(height - 1, colors.panel)
  writeCentered(height - 1, statusText, statusColor, colors.panel)
  clearLine(height, colors.panel)
  local help = selectedTab == 2
    and "[1-3] Tabs  [E] Edit  [A] Select  [S] Sync  [R] Scan  [Q] Quit"
    or selectedTab == 3
      and "[1-3] Tabs  [A] Apply  [S] Sync  [R] Scan  [Q] Quit"
      or "[1-3] Tabs   [R] Rescan   [Q] Quit"
  writeCentered(height, help, colors.muted, colors.panel)
end

local function render()
  buttons = {}
  setColors(colors.text, colors.background)
  gpu.fill(1, 1, width, height, " ")
  drawHeader()
  drawTabs()
  if selectedTab == 1 then
    drawOverview()
  elseif selectedTab == 2 then
    drawTarget()
  else
    drawScale()
  end
  drawStatusBar()
end

local function handleTouch(x, y)
  for index = #buttons, 1, -1 do
    local button = buttons[index]
    if button.enabled and y == button.y and x >= button.x1
        and x <= button.x2 then
      button.handler()
      return true
    end
  end
  return false
end

local function appendTargetCharacter(character)
  if character < string.byte("0") or character > string.byte("9") then
    return false
  end
  local digit = string.char(character)
  if replaceEditOnType then
    targetBuffer = digit
    replaceEditOnType = false
  elseif #targetBuffer < 11 then
    targetBuffer = targetBuffer .. digit
  end
  return true
end

local function handleTargetEditKey(character, code)
  if appendTargetCharacter(character) then
    return true
  elseif character == string.byte("-") then
    if replaceEditOnType then
      targetBuffer = "-"
    elseif string.sub(targetBuffer, 1, 1) == "-" then
      targetBuffer = string.sub(targetBuffer, 2)
    else
      targetBuffer = "-" .. targetBuffer
    end
    replaceEditOnType = false
    return true
  elseif character == 8 or code == 14 then
    if replaceEditOnType then
      targetBuffer = ""
      replaceEditOnType = false
    else
      targetBuffer = string.sub(targetBuffer, 1, -2)
    end
    return true
  elseif character == 13 or code == 28 then
    saveTargetEdit()
    return true
  elseif character == 27 or code == 1 then
    cancelTargetEdit(true)
    return true
  end
  return false
end

local function handleKey(character, code)
  if targetEditing and handleTargetEditKey(character, code) then
    return
  end
  if character >= string.byte("1") and character <= string.byte("3") then
    cancelTargetEdit(false)
    selectedTab = character - string.byte("0")
  elseif character == string.byte("r") or character == string.byte("R") then
    reconnect(true)
  elseif selectedTab == 2 and (character == string.byte("e")
      or character == string.byte("E")) then
    beginTargetEdit()
  elseif selectedTab == 2 and (character == string.byte("a")
      or character == string.byte("A") or character == 13 or code == 28) then
    applyTarget()
  elseif selectedTab == 2 and (character == string.byte("s")
      or character == string.byte("S")) then
    syncTarget(true)
  elseif selectedTab == 3 and (character == string.byte("a")
      or character == string.byte("A") or character == 13 or code == 28) then
    applyScale()
  elseif selectedTab == 3 and (character == string.byte("s")
      or character == string.byte("S")) then
    syncScale(true)
  elseif character == string.byte("q") or character == string.byte("Q") then
    running = false
  end
end

local function handlePlanetSelected(address, stationId, destinationId)
  if address ~= selector.address then
    return
  end
  cancelTargetEdit(false)
  targetDirty = false
  targetDraft = destinationId
  setStatus("Station " .. formatInteger(stationId) ..
    " selected target " .. formatInteger(destinationId), colors.good, 7)
  refreshSnapshot(false, true)
end

local function prepareDisplay()
  if not component.isAvailable("gpu") then
    error("No GPU is available")
  end
  gpu = component.gpu
  local screenAddress = gpu.getScreen()
  if not screenAddress then
    local iterator = component.list("screen", true)
    screenAddress = iterator()
    if not screenAddress then
      error("No screen is available")
    end
    gpu.bind(screenAddress, true)
  end
  oldWidth, oldHeight = gpu.getResolution()
  oldForeground, oldForegroundPalette = gpu.getForeground()
  oldBackground, oldBackgroundPalette = gpu.getBackground()
  local maximumWidth, maximumHeight = gpu.maxResolution()
  width = math.min(maximumWidth, 80)
  height = math.min(maximumHeight, 25)
  if width < 50 or height < 16 then
    error("The GUI requires at least a 50x16 screen resolution")
  end
  gpu.setResolution(width, height)
end

local function restoreDisplay()
  if not gpu then
    return
  end
  pcall(gpu.setResolution, oldWidth, oldHeight)
  pcall(gpu.setForeground, oldForeground, oldForegroundPalette)
  pcall(gpu.setBackground, oldBackground, oldBackgroundPalette)
  pcall(gpu.fill, 1, 1, oldWidth, oldHeight, " ")
end

local function run()
  prepareDisplay()
  reconnect(false)
  if selector.proxy then
    setStatus("Holographic Planet Selector ready", colors.good)
  else
    setStatus("Planet Selector is not connected - press R after connecting",
      colors.warning, 8)
  end
  render()

  while running do
    local pulled, name, first, second, third, fourth = pcall(
      event.pull, REFRESH_SECONDS)
    if not pulled then
      if string.find(string.lower(tostring(name)), "interrupted", 1, true) then
        running = false
      else
        error(name, 0)
      end
    elseif name == "interrupted" then
      running = false
    elseif name == "touch" then
      handleTouch(second, third)
    elseif name == "key_down" then
      handleKey(second, third)
    elseif name == "planet_selected" then
      handlePlanetSelected(first, second, third)
    elseif name == "component_added" or name == "component_removed" then
      reconnect(false)
    end

    if running then
      refreshSnapshot(false, false)
      render()
    end
  end
end

local ok, errorMessage = xpcall(run, tostring)
restoreDisplay()
if not ok then
  io.stderr:write(errorMessage .. "\n")
  return
end
print(APP_NAME .. " closed.")
