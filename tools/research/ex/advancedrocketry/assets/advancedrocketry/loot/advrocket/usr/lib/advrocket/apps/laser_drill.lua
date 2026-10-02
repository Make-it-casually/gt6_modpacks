-- AdvancedRocketry Continuation Orbital Laser Drill GUI for OpenOS.
-- Minecraft 1.7.10 / OpenComputers 1.12.44-GTNH.

local component = require("component")
local computer = require("computer")
local event = require("event")

local APP_NAME = "Advanced Rocketry Laser Drill"
local APP_VERSION = "1.0.0"
local REFRESH_SECONDS = 1
local MIN_COORDINATE = -30000000
local MAX_COORDINATE = 30000000

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

local laser = {
  componentName = "mining_laser",
  label = "Orbital Laser Drill"
}

local tabs = {"Status", "Target", "Mode"}
local modes = {"single", "line_x", "line_z", "spiral"}
local modeLabels = {
  single = "SINGLE",
  line_x = "LINE X",
  line_z = "LINE Z",
  spiral = "SPIRAL"
}
local stateLabels = {
  running = "Laser operation is active",
  ready = "Ready; apply redstone power to start",
  redstone_off = "Waiting for redstone power",
  incomplete_multiblock = "Multiblock structure is incomplete",
  no_lens = "No lens is installed",
  no_energy = "Insufficient energy",
  jammed = "Output inventory is jammed",
  finished = "Single target is complete",
  in_warp = "Station is currently in warp",
  invalid_target = "Laser is not above a valid target"
}

local selectedTab = 1
local snapshot = nil
local snapshotStale = false
local buttons = {}

local xDraft = nil
local zDraft = nil
local coordinatesDirty = false
local activeAxis = "x"
local coordinateEditing = false
local coordinateBuffer = ""
local replaceEditOnType = false
local modeDraft = nil
local modeDirty = false

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

local function cancelCoordinateEdit(showMessage)
  if not coordinateEditing then
    return
  end
  coordinateEditing = false
  coordinateBuffer = ""
  replaceEditOnType = false
  if showMessage then
    setStatus("Coordinate edit cancelled", colors.warning)
  end
end

local function disconnectLaser(message)
  laser.address = nil
  laser.proxy = nil
  laser.error = message
  snapshot = nil
  snapshotStale = false
  xDraft = nil
  zDraft = nil
  coordinatesDirty = false
  modeDraft = nil
  modeDirty = false
  cancelCoordinateEdit(false)
end

local function handleCallError(code, message)
  if tostring(code) == "invalid_tile" then
    disconnectLaser(tostring(code) .. ": " .. tostring(message))
  end
end

local function invokeGetter(method, ...)
  if not laser.proxy or not laser.address then
    return false, "not_connected", "Orbital Laser Drill is not connected"
  end
  local invoked, first, second, third = pcall(
    component.invoke, laser.address, method, ...)
  if not invoked then
    local reason = tostring(first)
    if isMissingMethod("", reason) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if first == nil then
    local code = tostring(second or "unknown_error")
    local message = tostring(third or "Laser Drill call failed")
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
  if not laser.proxy or not laser.address then
    return false, "not_connected", "Orbital Laser Drill is not connected"
  end
  local invoked, success, first, second = pcall(
    component.invoke, laser.address, method, ...)
  if not invoked then
    local reason = tostring(success)
    if isMissingMethod("", reason) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if success ~= true then
    local code = tostring(first or "unknown_error")
    local detail = tostring(second or "Laser Drill operation failed")
    handleCallError(code, detail)
    return false, code, detail
  end
  return true, first, second
end

local function findLaser()
  local ok, addressOrError = pcall(function()
    local iterator = component.list(laser.componentName, true)
    return iterator()
  end)
  if not ok or not addressOrError then
    disconnectLaser(ok and "not connected" or tostring(addressOrError))
    return false
  end
  local proxyOk, proxyOrError = pcall(component.proxy, addressOrError)
  if not proxyOk then
    disconnectLaser(tostring(proxyOrError))
    return false
  end
  laser.address = addressOrError
  laser.proxy = proxyOrError
  laser.error = nil
  return true
end

local function getFallbackSnapshot()
  local coordinatesOk, xOrCode, zOrMessage = invokeGetter("getCoordinates")
  if not coordinatesOk then
    return false, xOrCode, zOrMessage
  end
  local runningOk, runningOrCode, runningMessage = invokeGetter("isRunning")
  if not runningOk then
    return false, runningOrCode, runningMessage
  end
  local finishedOk, finishedOrCode, finishedMessage =
    invokeGetter("isFinished")
  if not finishedOk then
    return false, finishedOrCode, finishedMessage
  end
  local jammedOk, jammedOrCode, jammedMessage = invokeGetter("isJammed")
  if not jammedOk then
    return false, jammedOrCode, jammedMessage
  end
  local modeOk, modeOrCode, modeMessage = invokeGetter("getMode")
  if not modeOk then
    return false, modeOrCode, modeMessage
  end
  local state = runningOrCode and "running"
    or jammedOrCode and "jammed"
    or finishedOrCode and "finished" or "unknown"
  return true, {
    x = xOrCode,
    z = zOrMessage,
    mode = modeOrCode,
    running = runningOrCode == true,
    finished = finishedOrCode == true,
    jammed = jammedOrCode == true,
    multiblockComplete = nil,
    hasLens = nil,
    hasEnergy = nil,
    redstonePowered = nil,
    canSeeTarget = nil,
    state = state
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

local function refreshSnapshot(showErrors)
  if not laser.proxy then
    snapshot = nil
    snapshotStale = false
    return false
  end
  local ok, valueOrCode, message = getSnapshot()
  if not ok then
    laser.error = tostring(valueOrCode) .. ": " .. tostring(message)
    snapshotStale = snapshot ~= nil
    if showErrors then
      setStatus("Status refresh failed - " .. laser.error, colors.bad, 8)
    end
    return false
  end
  snapshot = valueOrCode
  snapshotStale = false
  laser.error = nil
  if not coordinatesDirty and not coordinateEditing then
    xDraft = snapshot.x
    zDraft = snapshot.z
  end
  if not modeDirty then
    modeDraft = snapshot.mode
  end
  return true
end

local function reconnect(showMessage)
  cancelCoordinateEdit(false)
  local found = findLaser()
  if found then
    refreshSnapshot(false)
  end
  if showMessage then
    if found then
      setStatus("Orbital Laser Drill connected [" .. shortAddress(laser.address) ..
        "]", colors.good)
    else
      setStatus("Orbital Laser Drill not found", colors.warning, 7)
    end
  end
end

local function setCoordinateDraft(axis, value)
  value = clamp(math.floor(value), MIN_COORDINATE, MAX_COORDINATE)
  if axis == "x" then
    xDraft = value
  else
    zDraft = value
  end
  coordinatesDirty = not snapshot or xDraft ~= snapshot.x or zDraft ~= snapshot.z
end

local function adjustCoordinate(amount)
  if coordinateEditing then
    return
  end
  local value = activeAxis == "x" and xDraft or zDraft
  if type(value) ~= "number" then
    value = 0
  end
  setCoordinateDraft(activeAxis, value + amount)
end

local function beginCoordinateEdit()
  local value = activeAxis == "x" and xDraft or zDraft
  coordinateEditing = true
  coordinateBuffer = type(value) == "number" and formatInteger(value) or ""
  replaceEditOnType = true
  setStatus("Editing " .. string.upper(activeAxis) ..
    " coordinate - type an integer, then press Enter", colors.accent, 30)
end

local function parseCoordinateBuffer()
  if coordinateBuffer == "" or coordinateBuffer == "-" then
    return nil
  end
  local value = tonumber(coordinateBuffer)
  if not value or value ~= math.floor(value) then
    return nil
  end
  return clamp(value, MIN_COORDINATE, MAX_COORDINATE)
end

local function saveCoordinateEdit()
  local value = parseCoordinateBuffer()
  if value == nil then
    setStatus("Enter a valid integer coordinate", colors.bad, 7)
    return false
  end
  coordinateEditing = false
  coordinateBuffer = ""
  replaceEditOnType = false
  setCoordinateDraft(activeAxis, value)
  setStatus(string.upper(activeAxis) ..
    " draft updated - press APPLY to commit", colors.accent)
  return true
end

local function syncCoordinates(showMessage)
  cancelCoordinateEdit(false)
  xDraft = snapshot and snapshot.x or nil
  zDraft = snapshot and snapshot.z or nil
  coordinatesDirty = false
  if showMessage then
    setStatus("Coordinate draft synchronized", colors.good)
  end
end

local function applyCoordinates()
  if coordinateEditing then
    setStatus("Finish editing before applying coordinates", colors.warning)
    return
  end
  if type(xDraft) ~= "number" or type(zDraft) ~= "number" then
    setStatus("Coordinate draft is unavailable", colors.bad)
    return
  end
  if not coordinatesDirty then
    setStatus("Coordinate draft already matches the laser target",
      colors.muted)
    return
  end
  local ok, xOrCode, zOrMessage = invokeMutator(
    "setCoordinates", xDraft, zDraft)
  if not ok then
    setStatus("Coordinates rejected - " .. tostring(xOrCode) .. ": " ..
      tostring(zOrMessage), colors.bad, 8)
    return
  end
  xDraft = xOrCode
  zDraft = zOrMessage
  coordinatesDirty = false
  refreshSnapshot(false)
  local suffix = snapshot and snapshot.running
    and " (applies to next activation)" or ""
  setStatus("Mining target set to X " .. formatInteger(xDraft) ..
    " / Z " .. formatInteger(zDraft) .. suffix, colors.good, 7)
end

local function findModeIndex(mode)
  for index, value in ipairs(modes) do
    if value == mode then
      return index
    end
  end
  return 1
end

local function selectMode(mode)
  modeDraft = mode
  modeDirty = not snapshot or mode ~= snapshot.mode
end

local function cycleMode(amount)
  local index = findModeIndex(modeDraft)
  index = ((index - 1 + amount) % #modes) + 1
  selectMode(modes[index])
end

local function syncMode(showMessage)
  modeDraft = snapshot and snapshot.mode or nil
  modeDirty = false
  if showMessage then
    setStatus("Mode draft synchronized", colors.good)
  end
end

local function applyMode()
  if not modeDirty then
    setStatus("Mode draft already matches the laser", colors.muted)
    return
  end
  if not modeDraft then
    setStatus("Mode draft is unavailable", colors.bad)
    return
  end
  if snapshot and snapshot.running then
    setStatus("Stop the laser with redstone before changing mode",
      colors.warning, 7)
    return
  end
  local ok, valueOrCode, message = invokeMutator("setMode", modeDraft)
  if not ok then
    setStatus("Mode rejected - " .. tostring(valueOrCode) .. ": " ..
      tostring(message), colors.bad, 8)
    return
  end
  modeDraft = valueOrCode
  modeDirty = false
  refreshSnapshot(false)
  setStatus("Mining mode set to " .. tostring(valueOrCode), colors.good)
end

local function requestUnjam()
  local ok, valueOrCode, message = invokeMutator("unjam")
  if not ok then
    setStatus("Unjam failed - " .. tostring(valueOrCode) .. ": " ..
      tostring(message), colors.bad, 8)
    return
  end
  refreshSnapshot(false)
  if valueOrCode == true then
    setStatus(snapshot and snapshot.jammed
      and "Unjam attempted, but the output remains blocked"
      or "Jam cleared successfully",
      snapshot and snapshot.jammed and colors.warning or colors.good, 7)
  else
    setStatus("Unjam check complete - output was not jammed", colors.muted)
  end
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
    function() cancelCoordinateEdit(false) selectedTab = 1 end,
    selectedTab == 1)
  drawButton(baseWidth + 1, 3, baseWidth, tabs[2], true,
    function() selectedTab = 2 end, selectedTab == 2)
  drawButton(baseWidth * 2 + 1, 3, width - baseWidth * 2, tabs[3], true,
    function() cancelCoordinateEdit(false) selectedTab = 3 end,
    selectedTab == 3)
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

local function stateColor(state)
  if state == "running" or state == "ready" then
    return colors.good
  elseif state == "jammed" or state == "no_energy"
      or state == "incomplete_multiblock" or state == "no_lens" then
    return colors.bad
  elseif state == "redstone_off" or state == "finished"
      or state == "in_warp" or state == "invalid_target" then
    return colors.warning
  end
  return colors.muted
end

local function drawCheck(x, y, label, value)
  local color = value == true and colors.good
    or value == false and colors.bad or colors.muted
  writeAt(x, y, label .. ": " .. yesNo(value), color,
    colors.background, math.floor(width / 2) - 2)
end

local function drawStatus()
  drawPageHeader("LASER STATUS")
  if not laser.proxy then
    drawUnavailable("Orbital Laser Drill: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Laser status unavailable", laser.error, colors.warning)
    return
  end

  local state = tostring(snapshot.state or "unknown")
  writeAt(2, 5, "State: " .. state:gsub("_", " "):upper(),
    stateColor(state), colors.background, width - 3)
  writeAt(2, 6, stateLabels[state] or "Status details unavailable",
    colors.muted, colors.background, width - 3)
  writeAt(2, 7, "Target X: " .. formatInteger(snapshot.x), colors.text)
  writeAt(math.floor(width / 2) + 1, 7,
    "Target Z: " .. formatInteger(snapshot.z), colors.text)
  writeAt(2, 8, "Mode: " .. tostring(modeLabels[snapshot.mode]
    or snapshot.mode or "--"), colors.text)
  writeAt(math.floor(width / 2) + 1, 8,
    "Running: " .. yesNo(snapshot.running),
    snapshot.running and colors.good or colors.muted)

  local right = math.floor(width / 2) + 1
  drawCheck(2, 10, "Structure", snapshot.multiblockComplete)
  drawCheck(right, 10, "Lens", snapshot.hasLens)
  drawCheck(2, 11, "Energy", snapshot.hasEnergy)
  drawCheck(right, 11, "Redstone", snapshot.redstonePowered)
  drawCheck(2, 12, "Target visible", snapshot.canSeeTarget)
  drawCheck(right, 12, "Finished", snapshot.finished)

  local unjamY = math.min(14, height - 3)
  drawButton(math.floor((width - 16) / 2) + 1, unjamY, 16,
    snapshot.jammed and "UNJAM OUTPUT" or "CHECK OUTPUT", true,
    requestUnjam, snapshot.jammed == true)
end

local function drawCoordinateButtons(y)
  local definitions = {{"-1000", -1000}, {"-100", -100}, {"-1", -1},
    {"+1", 1}, {"+100", 100}, {"+1000", 1000}}
  local buttonWidth = width >= 66 and 8 or 6
  local gap = 1
  local totalWidth = #definitions * buttonWidth + (#definitions - 1) * gap
  local x = math.floor((width - totalWidth) / 2) + 1
  for _, definition in ipairs(definitions) do
    local amount = definition[2]
    drawButton(x, y, buttonWidth, definition[1], not coordinateEditing,
      function() adjustCoordinate(amount) end)
    x = x + buttonWidth + gap
  end
end

local function drawTarget()
  drawPageHeader("MINING TARGET")
  if not laser.proxy then
    drawUnavailable("Orbital Laser Drill: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Coordinate status unavailable", laser.error,
      colors.warning)
    return
  end

  writeAt(2, 5, "Current X: " .. formatInteger(snapshot.x), colors.text)
  writeAt(math.floor(width / 2) + 1, 5,
    "Current Z: " .. formatInteger(snapshot.z), colors.text)
  clearLine(6, colors.panel)
  local shownX = coordinateEditing and activeAxis == "x"
    and coordinateBuffer or formatInteger(xDraft)
  local shownZ = coordinateEditing and activeAxis == "z"
    and coordinateBuffer or formatInteger(zDraft)
  writeAt(2, 6, "Draft X: " .. shownX,
    activeAxis == "x" and colors.accent
      or coordinatesDirty and colors.warning or colors.good,
    colors.panel, math.floor(width / 2) - 2)
  writeAt(math.floor(width / 2) + 1, 6, "Draft Z: " .. shownZ,
    activeAxis == "z" and colors.accent
      or coordinatesDirty and colors.warning or colors.good,
    colors.panel, width - math.floor(width / 2))
  writeCentered(7, coordinateEditing
    and ("Editing " .. string.upper(activeAxis) ..
      " | Enter: save draft | Esc: cancel")
    or ("Active axis: " .. string.upper(activeAxis) ..
      "   Coordinates apply atomically"),
    coordinateEditing and colors.accent or colors.muted)

  drawCoordinateButtons(9)

  local axisWidth, editWidth = 10, 10
  local total = axisWidth * 2 + editWidth + 2
  local x = math.floor((width - total) / 2) + 1
  drawButton(x, 11, axisWidth, "X AXIS", not coordinateEditing,
    function() activeAxis = "x" end, activeAxis == "x")
  drawButton(x + axisWidth + 1, 11, axisWidth, "Z AXIS",
    not coordinateEditing, function() activeAxis = "z" end,
    activeAxis == "z")
  drawButton(x + axisWidth * 2 + 2, 11, editWidth,
    coordinateEditing and "SAVE" or "EDIT", true,
    coordinateEditing and saveCoordinateEdit or beginCoordinateEdit,
    coordinateEditing)

  local applyWidth, syncWidth = 14, 14
  x = math.floor((width - applyWidth - syncWidth - 1) / 2) + 1
  drawButton(x, 13, applyWidth, "APPLY TARGET", coordinatesDirty,
    applyCoordinates)
  drawButton(x + applyWidth + 1, 13, syncWidth, "SYNC", not coordinateEditing,
    function() syncCoordinates(true) end)
end

local function drawMode()
  drawPageHeader("MINING MODE")
  if not laser.proxy then
    drawUnavailable("Orbital Laser Drill: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Mode status unavailable", laser.error, colors.warning)
    return
  end

  writeCentered(5, "Current mode: " .. tostring(modeLabels[snapshot.mode]
    or snapshot.mode or "--"), colors.text)
  writeCentered(6, "Draft mode: " .. tostring(modeLabels[modeDraft]
    or modeDraft or "--"), modeDirty and colors.warning or colors.good)

  local buttonWidth = 14
  local gap = 1
  local total = buttonWidth * 2 + gap
  local x = math.floor((width - total) / 2) + 1
  drawButton(x, 8, buttonWidth, "SINGLE", true,
    function() selectMode("single") end, modeDraft == "single")
  drawButton(x + buttonWidth + gap, 8, buttonWidth, "LINE X", true,
    function() selectMode("line_x") end, modeDraft == "line_x")
  drawButton(x, 10, buttonWidth, "LINE Z", true,
    function() selectMode("line_z") end, modeDraft == "line_z")
  drawButton(x + buttonWidth + gap, 10, buttonWidth, "SPIRAL", true,
    function() selectMode("spiral") end, modeDraft == "spiral")

  local applyWidth, syncWidth = 14, 14
  x = math.floor((width - applyWidth - syncWidth - 1) / 2) + 1
  drawButton(x, 12, applyWidth, "APPLY MODE",
    modeDirty and snapshot.running ~= true, applyMode)
  drawButton(x + applyWidth + 1, 12, syncWidth, "SYNC", true,
    function() syncMode(true) end)
  writeCentered(14, snapshot.running
    and "Mode cannot change while the laser is running"
    or "Start and stop remain controlled by redstone input",
    snapshot.running and colors.warning or colors.muted)
end

local function drawHeader()
  writeCentered(1, APP_NAME .. "  v" .. APP_VERSION, colors.accent)
  local state = not laser.proxy and "offline"
    or snapshot and snapshot.state or "checking"
  local color = not laser.proxy and colors.bad
    or snapshot and stateColor(state) or colors.warning
  if snapshotStale then
    state = "stale"
    color = colors.warning
  end
  writeCentered(2, "Laser [" .. shortAddress(laser.address) .. "]  " ..
    tostring(state):gsub("_", " "):upper(), color)
end

local function drawStatusBar()
  if coordinateEditing then
    statusText = "Editing " .. string.upper(activeAxis) ..
      " coordinate - Enter saves the local draft"
    statusColor = colors.accent
  elseif statusExpiresAt > 0 and computer.uptime() >= statusExpiresAt then
    statusText = "Ready"
    statusColor = colors.muted
    statusExpiresAt = 0
  end
  clearLine(height - 1, colors.panel)
  writeCentered(height - 1, statusText, statusColor, colors.panel)
  clearLine(height, colors.panel)
  local help = selectedTab == 1
    and "[1-3] Tabs  [U] Unjam  [R] Rescan  [Q] Quit"
    or selectedTab == 2
      and "[1-3] Tabs  [X/Z] Axis  [E] Edit  [A] Apply  [Q] Quit"
      or "[1-3] Tabs  [Arrows] Mode  [A] Apply  [S] Sync  [Q] Quit"
  writeCentered(height, help, colors.muted, colors.panel)
end

local function render()
  buttons = {}
  setColors(colors.text, colors.background)
  gpu.fill(1, 1, width, height, " ")
  drawHeader()
  drawTabs()
  if selectedTab == 1 then
    drawStatus()
  elseif selectedTab == 2 then
    drawTarget()
  else
    drawMode()
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

local function appendCoordinateCharacter(character)
  if character < string.byte("0") or character > string.byte("9") then
    return false
  end
  local digit = string.char(character)
  if replaceEditOnType then
    coordinateBuffer = digit
    replaceEditOnType = false
  elseif #coordinateBuffer < 9 then
    coordinateBuffer = coordinateBuffer .. digit
  end
  return true
end

local function handleCoordinateEditKey(character, code)
  if appendCoordinateCharacter(character) then
    return true
  elseif character == string.byte("-") then
    if replaceEditOnType then
      coordinateBuffer = "-"
    elseif string.sub(coordinateBuffer, 1, 1) == "-" then
      coordinateBuffer = string.sub(coordinateBuffer, 2)
    else
      coordinateBuffer = "-" .. coordinateBuffer
    end
    replaceEditOnType = false
    return true
  elseif character == 8 or code == 14 then
    if replaceEditOnType then
      coordinateBuffer = ""
      replaceEditOnType = false
    else
      coordinateBuffer = string.sub(coordinateBuffer, 1, -2)
    end
    return true
  elseif character == 13 or code == 28 then
    saveCoordinateEdit()
    return true
  elseif character == 27 or code == 1 then
    cancelCoordinateEdit(true)
    return true
  end
  return false
end

local function handleKey(character, code)
  if coordinateEditing and handleCoordinateEditKey(character, code) then
    return
  end
  if character >= string.byte("1") and character <= string.byte("3") then
    cancelCoordinateEdit(false)
    selectedTab = character - string.byte("0")
  elseif character == string.byte("r") or character == string.byte("R") then
    reconnect(true)
  elseif selectedTab == 1 and (character == string.byte("u")
      or character == string.byte("U")) then
    requestUnjam()
  elseif selectedTab == 2 and (character == string.byte("x")
      or character == string.byte("X")) then
    activeAxis = "x"
  elseif selectedTab == 2 and (character == string.byte("z")
      or character == string.byte("Z")) then
    activeAxis = "z"
  elseif selectedTab == 2 and (character == string.byte("e")
      or character == string.byte("E")) then
    beginCoordinateEdit()
  elseif selectedTab == 2 and (character == string.byte("a")
      or character == string.byte("A") or character == 13 or code == 28) then
    applyCoordinates()
  elseif selectedTab == 2 and (character == string.byte("s")
      or character == string.byte("S")) then
    syncCoordinates(true)
  elseif selectedTab == 2 and code == 203 then
    adjustCoordinate(-1)
  elseif selectedTab == 2 and code == 205 then
    adjustCoordinate(1)
  elseif selectedTab == 3 and (code == 203 or code == 200) then
    cycleMode(-1)
  elseif selectedTab == 3 and (code == 205 or code == 208) then
    cycleMode(1)
  elseif selectedTab == 3 and (character == string.byte("a")
      or character == string.byte("A") or character == 13 or code == 28) then
    applyMode()
  elseif selectedTab == 3 and (character == string.byte("s")
      or character == string.byte("S")) then
    syncMode(true)
  elseif character == string.byte("q") or character == string.byte("Q") then
    running = false
  end
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
  if laser.proxy then
    setStatus("Orbital Laser Drill ready", colors.good)
  else
    setStatus("Orbital Laser Drill is not connected - press R after connecting",
      colors.warning, 8)
  end
  render()

  while running do
    local pulled, name, first, second, third = pcall(
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
    elseif name == "component_added" or name == "component_removed" then
      reconnect(false)
    end

    if running then
      refreshSnapshot(false)
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
