-- AdvancedRocketry Continuation Atmosphere Detector GUI for OpenOS.
-- Minecraft 1.7.10 / OpenComputers 1.12.44-GTNH.

local component = require("component")
local computer = require("computer")
local event = require("event")

local APP_NAME = "Advanced Rocketry Atmosphere Detector"
local APP_VERSION = "1.1.0"
local REFRESH_SECONDS = 1

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

local detector = {
  componentName = "atmosphere_detector",
  label = "Atmosphere Detector"
}

local tabs = {"Surroundings", "Target"}
local directions = {
  {name = "down", label = "DOWN", side = 0},
  {name = "up", label = "UP", side = 1},
  {name = "north", label = "NORTH", side = 2},
  {name = "south", label = "SOUTH", side = 3},
  {name = "west", label = "WEST", side = 4},
  {name = "east", label = "EAST", side = 5}
}

local selectedTab = 1
local detectorAddresses = {}
local selectedDetectorIndex = 0
local snapshot = nil
local snapshotStale = false
local atmosphereIds = {}
local selectedAtmosphereIndex = 1
local selectionDirty = false
local targetPage = 1
local pageSize = 1
local buttons = {}

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

local function cleanText(value)
  return tostring(value or ""):gsub("[%c]", "?")
end

local function shortAddress(address)
  if type(address) ~= "string" then
    return "--------"
  end
  return string.sub(address, 1, 8)
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
  local x = math.floor((width - #text) / 2) + 1
  writeAt(x, y, text, foreground, background)
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

local function clearDetectorState(message)
  detector.address = nil
  detector.proxy = nil
  detector.error = message
  snapshot = nil
  snapshotStale = false
  atmosphereIds = {}
  selectedAtmosphereIndex = 1
  selectionDirty = false
  targetPage = 1
end

local function disconnectDetector(message)
  clearDetectorState(message)
  detectorAddresses = {}
  selectedDetectorIndex = 0
end

local function handleCallError(code, message)
  if tostring(code) == "invalid_tile" then
    disconnectDetector(tostring(code) .. ": " .. tostring(message))
  end
end

local function invokeGetter(method, ...)
  if not detector.proxy or not detector.address then
    return false, "not_connected", "Atmosphere Detector is not connected"
  end

  local invoked, first, second, third = pcall(
    component.invoke, detector.address, method, ...)
  if not invoked then
    local reason = tostring(first)
    if isMissingMethod("", reason) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if first == nil then
    local code = tostring(second or "unknown_error")
    local message = tostring(third or "Atmosphere Detector call failed")
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
  if not detector.proxy or not detector.address then
    return false, "not_connected", "Atmosphere Detector is not connected"
  end

  local invoked, success, valueOrCode, message = pcall(
    component.invoke, detector.address, method, ...)
  if not invoked then
    local reason = tostring(success)
    if isMissingMethod("", reason) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if success ~= true then
    local code = tostring(valueOrCode or "unknown_error")
    local detail = tostring(message or "Atmosphere Detector operation failed")
    handleCallError(code, detail)
    return false, code, detail
  end
  return true, valueOrCode, message
end

local function connectDetector(index)
  clearDetectorState(nil)
  if #detectorAddresses == 0 then
    detector.error = "not connected"
    return false
  end

  selectedDetectorIndex = math.max(1, math.min(#detectorAddresses,
    tonumber(index) or 1))
  local address = detectorAddresses[selectedDetectorIndex]
  local proxyOk, proxyOrError = pcall(component.proxy, address)
  if not proxyOk then
    detector.address = address
    detector.error = tostring(proxyOrError)
    return false
  end
  detector.address = address
  detector.proxy = proxyOrError
  detector.error = nil
  return true
end

local function scanDetectors(preferredAddress)
  local previousIndex = selectedDetectorIndex
  local ok, addressesOrError = pcall(function()
    local addresses = {}
    for address in component.list(detector.componentName, true) do
      addresses[#addresses + 1] = address
    end
    table.sort(addresses)
    return addresses
  end)
  if not ok then
    disconnectDetector(tostring(addressesOrError))
    return false
  end

  detectorAddresses = addressesOrError
  if #detectorAddresses == 0 then
    clearDetectorState("not connected")
    selectedDetectorIndex = 0
    return false
  end

  local selected = nil
  if type(preferredAddress) == "string" then
    for index, address in ipairs(detectorAddresses) do
      if address == preferredAddress then
        selected = index
        break
      end
    end
  end
  selected = selected or math.max(1,
    math.min(#detectorAddresses, previousIndex > 0 and previousIndex or 1))
  return connectDetector(selected)
end

local function getFallbackSnapshot()
  local targetOk, targetOrCode, targetMessage =
    invokeGetter("getTargetAtmosphere")
  if not targetOk then
    return false, targetOrCode, targetMessage
  end
  local detectedOk, detectedOrCode, detectedMessage = invokeGetter("isDetected")
  if not detectedOk then
    return false, detectedOrCode, detectedMessage
  end

  local atmospheres = {}
  for _, direction in ipairs(directions) do
    local sideOk, sideOrCode, sideMessage =
      invokeGetter("getAtmosphere", direction.side)
    if not sideOk then
      return false, sideOrCode, sideMessage
    end
    atmospheres[direction.name] = sideOrCode
  end
  return true, {
    target = targetOrCode,
    detected = detectedOrCode == true,
    powered = nil,
    atmospheres = atmospheres
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

local function findAtmosphereIndex(id)
  for index, value in ipairs(atmosphereIds) do
    if value == id then
      return index
    end
  end
  return nil
end

local function pageCount()
  return math.max(1, math.ceil(#atmosphereIds / pageSize))
end

local function ensureSelectionVisible()
  targetPage = math.floor((math.max(1, selectedAtmosphereIndex) - 1) /
    pageSize) + 1
  targetPage = math.max(1, math.min(pageCount(), targetPage))
end

local function syncSelectionToTarget()
  if selectionDirty or not snapshot then
    return
  end
  local index = findAtmosphereIndex(snapshot.target)
  if index then
    selectedAtmosphereIndex = index
    ensureSelectionVisible()
  end
end

local function loadAtmosphereList(showMessage)
  local ok, valueOrCode, message = invokeGetter("listAtmospheres")
  if not ok then
    detector.error = tostring(valueOrCode) .. ": " .. tostring(message)
    if showMessage then
      setStatus("Atmosphere list failed - " .. detector.error, colors.bad, 8)
    end
    return false
  end
  if type(valueOrCode) ~= "table" then
    detector.error = "invalid_response: listAtmospheres did not return a table"
    return false
  end

  local previous = atmosphereIds[selectedAtmosphereIndex]
  atmosphereIds = {}
  for _, id in ipairs(valueOrCode) do
    if type(id) == "string" and id ~= "" then
      atmosphereIds[#atmosphereIds + 1] = id
    end
  end
  table.sort(atmosphereIds)
  local index = previous and findAtmosphereIndex(previous) or nil
  selectedAtmosphereIndex = index or 1
  selectionDirty = index ~= nil and selectionDirty or false
  syncSelectionToTarget()
  ensureSelectionVisible()
  return true
end

local function refreshSnapshot(showErrors)
  if not detector.proxy then
    snapshot = nil
    snapshotStale = false
    return false
  end
  local ok, valueOrCode, message = getSnapshot()
  if not ok then
    detector.error = tostring(valueOrCode) .. ": " .. tostring(message)
    snapshotStale = snapshot ~= nil
    if showErrors then
      setStatus("Status refresh failed - " .. detector.error, colors.bad, 8)
    end
    return false
  end
  snapshot = valueOrCode
  snapshotStale = false
  detector.error = nil
  syncSelectionToTarget()
  return true
end

local function reconnect(showMessage)
  local preferredAddress = detector.address
  local found = scanDetectors(preferredAddress)
  if found then
    refreshSnapshot(false)
    loadAtmosphereList(false)
  end
  if showMessage then
    if found then
      setStatus("Atmosphere Detector connected [" ..
        shortAddress(detector.address) .. "] (" ..
        selectedDetectorIndex .. "/" .. #detectorAddresses .. ")",
        colors.good)
    else
      setStatus("Atmosphere Detector not found", colors.warning, 7)
    end
  end
end

local function switchDetector(offset)
  if #detectorAddresses < 2 then
    setStatus(#detectorAddresses == 0 and "No Atmosphere Detector found"
      or "Only one Atmosphere Detector is connected", colors.muted)
    return false
  end
  local index = ((selectedDetectorIndex - 1 + offset) %
    #detectorAddresses) + 1
  if not connectDetector(index) then
    setStatus("Detector connection failed - " ..
      tostring(detector.error), colors.bad, 8)
    return false
  end
  refreshSnapshot(false)
  loadAtmosphereList(false)
  setStatus("Selected Atmosphere Detector [" ..
    shortAddress(detector.address) .. "] (" .. selectedDetectorIndex ..
    "/" .. #detectorAddresses .. ")", colors.good)
  return true
end

local function selectAtmosphere(index)
  if #atmosphereIds == 0 then
    return
  end
  selectedAtmosphereIndex = math.max(1, math.min(#atmosphereIds, index))
  selectionDirty = not snapshot
    or atmosphereIds[selectedAtmosphereIndex] ~= snapshot.target
  ensureSelectionVisible()
end

local function setTargetPage(newPage)
  targetPage = math.max(1, math.min(pageCount(), newPage))
  local first = (targetPage - 1) * pageSize + 1
  local last = math.min(#atmosphereIds, first + pageSize - 1)
  if selectedAtmosphereIndex < first or selectedAtmosphereIndex > last then
    selectAtmosphere(first)
  end
end

local function applyTarget()
  if not selectionDirty then
    setStatus("Selected atmosphere is already the detector target",
      colors.muted)
    return
  end
  local id = atmosphereIds[selectedAtmosphereIndex]
  if not id then
    setStatus("No registered atmosphere is selected", colors.warning)
    return
  end
  local ok, valueOrCode, message = invokeMutator("setTargetAtmosphere", id)
  if not ok then
    setStatus("Target rejected - " .. tostring(valueOrCode) .. ": " ..
      tostring(message), colors.bad, 8)
    return
  end
  selectionDirty = false
  refreshSnapshot(false)
  setStatus("Detector target set to " .. tostring(valueOrCode), colors.good)
end

local function syncTarget(showMessage)
  selectionDirty = false
  syncSelectionToTarget()
  if showMessage then
    setStatus("Selection synchronized with detector target", colors.good)
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
  local firstWidth = math.floor(width / 2)
  drawButton(1, 3, firstWidth, tabs[1], true,
    function() selectedTab = 1 end, selectedTab == 1)
  drawButton(firstWidth + 1, 3, width - firstWidth, tabs[2], true,
    function() selectedTab = 2 end, selectedTab == 2)
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

local function atmosphereColor(entry)
  if type(entry) ~= "table" then
    return colors.muted
  elseif entry.breathable then
    return colors.good
  elseif entry.allowsCombustion then
    return colors.warning
  end
  return colors.bad
end

local function drawSurroundings()
  drawPageHeader("ADJACENT ATMOSPHERES")
  if not detector.proxy then
    drawUnavailable("Atmosphere Detector: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Detector status unavailable", detector.error,
      colors.warning)
    return
  end

  local detectedColor = snapshot.detected and colors.good or colors.muted
  writeAt(2, 5, "Target: " .. tostring(snapshot.target or "--"), colors.text,
    colors.background, math.floor(width / 2) - 2)
  writeAt(math.floor(width / 2) + 1, 5,
    "Detected: " .. yesNo(snapshot.detected), detectedColor)
  if snapshot.powered ~= nil and width >= 66 then
    writeAt(width - 13, 5, "Power: " .. yesNo(snapshot.powered),
      snapshot.powered and colors.warning or colors.muted)
  end

  clearLine(6, colors.panel)
  writeAt(2, 6, "SIDE", colors.muted, colors.panel)
  writeAt(11, 6, "ATMOSPHERE ID", colors.muted, colors.panel)
  writeAt(math.max(31, width - 20), 6, "BREATH  COMBUST", colors.muted,
    colors.panel)

  for index, direction in ipairs(directions) do
    local y = 6 + index
    local background = index % 2 == 0 and colors.panel or colors.background
    clearLine(y, background)
    local entry = snapshot.atmospheres and snapshot.atmospheres[direction.name]
      or nil
    writeAt(2, y, direction.label, colors.muted, background, 8)
    writeAt(11, y, entry and entry.id or "--", atmosphereColor(entry),
      background, math.max(8, width - 32))
    writeAt(math.max(31, width - 20), y,
      yesNo(entry and entry.breathable),
      entry and entry.breathable and colors.good or colors.muted, background)
    writeAt(math.max(40, width - 11), y,
      yesNo(entry and entry.allowsCombustion),
      entry and entry.allowsCombustion and colors.good or colors.bad,
      background)
  end
end

local function drawAtmosphereRow(y, index, id)
  local selected = index == selectedAtmosphereIndex
  local background = selected and colors.panelActive
    or index % 2 == 0 and colors.panel or colors.background
  clearLine(y, background)
  local marker = snapshot and id == snapshot.target and "*" or " "
  writeAt(2, y, marker .. " " .. id,
    selected and colors.buttonText or colors.text, background, width - 3)
  buttons[#buttons + 1] = {
    x1 = 1,
    x2 = width,
    y = y,
    enabled = true,
    handler = function() selectAtmosphere(index) end
  }
end

local function drawTarget()
  drawPageHeader("DETECTOR TARGET")
  if not detector.proxy then
    drawUnavailable("Atmosphere Detector: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if #atmosphereIds == 0 then
    drawUnavailable("No atmosphere IDs available", detector.error,
      colors.warning)
    return
  end

  clearLine(5, colors.panel)
  writeAt(2, 5, "* current target", colors.muted, colors.panel)
  writeAt(math.max(26, width - 22), 5,
    "Page " .. targetPage .. "/" .. pageCount(), colors.muted, colors.panel)

  local first = (targetPage - 1) * pageSize + 1
  local last = math.min(#atmosphereIds, first + pageSize - 1)
  for index = first, last do
    drawAtmosphereRow(6 + index - first, index, atmosphereIds[index])
  end

  local actionY = height - 3
  local buttonWidth = math.floor((width - 2) / 3)
  drawButton(1, actionY, buttonWidth, "< PREV", targetPage > 1,
    function() setTargetPage(targetPage - 1) end)
  drawButton(buttonWidth + 2, actionY, buttonWidth, "APPLY",
    selectionDirty, applyTarget)
  drawButton(buttonWidth * 2 + 3, actionY,
    width - (buttonWidth * 2 + 2), "NEXT >", targetPage < pageCount(),
    function() setTargetPage(targetPage + 1) end)
end

local function drawHeader()
  writeCentered(1, APP_NAME .. "  v" .. APP_VERSION, colors.accent)
  local state = detector.proxy and "ONLINE" or "OFFLINE"
  local stateColor = detector.proxy and colors.good or colors.bad
  if snapshotStale then
    state = "STALE"
    stateColor = colors.warning
  end
  local selectorWidth = 10
  drawButton(1, 2, selectorWidth, "< DEVICE", #detectorAddresses > 1,
    function() switchDetector(-1) end)
  drawButton(width - selectorWidth + 1, 2, selectorWidth, "DEVICE >",
    #detectorAddresses > 1, function() switchDetector(1) end)

  local count = #detectorAddresses
  local position = selectedDetectorIndex > 0 and selectedDetectorIndex or 0
  local summary = "Detector " .. position .. "/" .. count .. " [" ..
    shortAddress(detector.address) .. "] " .. state
  local available = width - selectorWidth * 2
  if #summary > available then
    summary = string.sub(summary, 1, available)
  end
  local x = selectorWidth + math.floor((available - #summary) / 2) + 1
  writeAt(x, 2, summary, stateColor, colors.background, available)
end

local function drawStatusBar()
  if statusExpiresAt > 0 and computer.uptime() >= statusExpiresAt then
    statusText = "Ready"
    statusColor = colors.muted
    statusExpiresAt = 0
  end
  clearLine(height - 1, colors.panel)
  writeCentered(height - 1, statusText, statusColor, colors.panel)
  clearLine(height, colors.panel)
  local help
  if selectedTab == 2 and width >= 65 then
    help = "[1-2] Tabs  [[/]] Device  [Arrows] Select  [Enter] Apply  [Q] Quit"
  elseif selectedTab == 2 then
    help = "[[/]] Device  [Arrows] Select  [Enter] Apply  [Q] Quit"
  else
    help = "[1-2] Tabs  [[/]] Device  [R] Rescan  [Q] Quit"
  end
  writeCentered(height, help, colors.muted, colors.panel)
end

local function render()
  buttons = {}
  setColors(colors.text, colors.background)
  gpu.fill(1, 1, width, height, " ")
  drawHeader()
  drawTabs()
  if selectedTab == 1 then
    drawSurroundings()
  else
    drawTarget()
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

local function handleKey(character, code)
  if character >= string.byte("1") and character <= string.byte("2") then
    selectedTab = character - string.byte("0")
  elseif character == string.byte("[") then
    switchDetector(-1)
  elseif character == string.byte("]") then
    switchDetector(1)
  elseif character == string.byte("r") or character == string.byte("R") then
    reconnect(true)
  elseif selectedTab == 2 and (code == 200
      or character == string.byte("w") or character == string.byte("W")) then
    selectAtmosphere(selectedAtmosphereIndex - 1)
  elseif selectedTab == 2 and (code == 208
      or character == string.byte("s") or character == string.byte("S")) then
    selectAtmosphere(selectedAtmosphereIndex + 1)
  elseif selectedTab == 2 and code == 201 then
    setTargetPage(targetPage - 1)
  elseif selectedTab == 2 and code == 209 then
    setTargetPage(targetPage + 1)
  elseif selectedTab == 2 and code == 199 then
    selectAtmosphere(1)
  elseif selectedTab == 2 and code == 207 then
    selectAtmosphere(#atmosphereIds)
  elseif selectedTab == 2 and (character == 13 or code == 28) then
    applyTarget()
  elseif selectedTab == 2 and (character == string.byte("x")
      or character == string.byte("X")) then
    syncTarget(true)
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
  pageSize = math.max(1, height - 10)
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
  if detector.proxy then
    setStatus("Atmosphere Detector ready", colors.good)
  else
    setStatus("Atmosphere Detector is not connected - press R after connecting",
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
