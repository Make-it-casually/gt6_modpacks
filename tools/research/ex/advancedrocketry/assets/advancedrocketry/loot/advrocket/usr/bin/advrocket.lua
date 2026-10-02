-- AdvancedRocketry Continuation AdvRocket suite launcher for OpenOS.
-- Minecraft 1.7.10 / OpenComputers 1.12.44-GTNH.

local component = require("component")
local computer = require("computer")
local event = require("event")
local filesystem = require("filesystem")
local shell = require("shell")

local APP_NAME = "Advanced Rocketry Control Suite"
local APP_VERSION = "1.0.0"
local REFRESH_SECONDS = 1
local APP_DIRECTORY = "/usr/lib/advrocket/apps"

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

local programs = {
  {label = "Station Control", file = "station_control.lua"},
  {label = "Biome Scanner", file = "biome_scanner.lua"},
  {label = "Rocket Monitor", file = "rocket_monitor.lua"},
  {label = "Warp Controller", file = "warp_controller.lua"},
  {label = "Atmosphere Detector", file = "atmosphere_detector.lua"},
  {label = "Planet Selector", file = "planet_selector.lua"},
  {label = "Laser Drill", file = "laser_drill.lua"}
}

local controllers = {
  warp = {componentName = "warp_controller"},
  altitude = {componentName = "altitude_controller"}
}

local values = {
  time = "--:--",
  timeColor = colors.text,
  orbit = "ERROR",
  orbitColor = colors.bad,
  altitude = "ERROR",
  altitudeColor = colors.bad
}

local selectedProgram = 1
local buttons = {}
local running = true
local statusText = "Starting..."
local statusColor = colors.muted
local statusExpiresAt = 0
local defaultStatusText = "Ready"
local defaultStatusColor = colors.muted

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

local function findController(controller)
  local listed, addressOrError = pcall(function()
    local iterator = component.list(controller.componentName, true)
    return iterator()
  end)
  if not listed or not addressOrError then
    controller.address = nil
    controller.error = listed and (controller.componentName .. " not found")
      or cleanText(addressOrError)
    return false
  end
  controller.address = addressOrError
  controller.error = nil
  return true
end

local function rescanControllers(showMessage)
  local found = 0
  for _, controller in pairs(controllers) do
    if findController(controller) then
      found = found + 1
    end
  end
  if showMessage then
    setStatus("Component scan complete: " .. found .. "/2 connected",
      found == 2 and colors.good or colors.warning)
  end
end

local function missingMethod(code, message)
  local combined = string.lower(tostring(code or "") .. " " ..
    tostring(message or ""))
  return string.find(combined, "no such method", 1, true) ~= nil
    or string.find(combined, "unknown method", 1, true) ~= nil
    or string.find(combined, "not available", 1, true) ~= nil
end

local function invokeGetter(controller, method)
  if not controller.address then
    return false, "not_connected", controller.componentName .. " not found"
  end
  local invoked, first, second, third = pcall(component.invoke,
    controller.address, method)
  if not invoked then
    local message = cleanText(first)
    return false, missingMethod(nil, message) and "missing_method"
      or "oc_exception", message
  end
  if first == nil then
    local code = cleanText(second or "unknown_error")
    local message = cleanText(third or "Getter failed")
    if missingMethod(code, message) then
      code = "missing_method"
    end
    return false, code, message
  end
  return true, first
end

local function refreshValues()
  local timeOk, gameTime = pcall(os.date, "%H:%M")
  if timeOk and type(gameTime) == "string" and #gameTime > 0 then
    values.time = cleanText(gameTime)
    values.timeColor = colors.text
  else
    values.time = "ERROR"
    values.timeColor = colors.bad
  end

  local diagnostics = {}
  local hasError = false
  local hasWarning = false
  local warp = controllers.warp
  if not warp.address then
    values.orbit = "ERROR"
    values.orbitColor = colors.bad
    hasError = true
    diagnostics[#diagnostics + 1] = "warp_controller not found"
  else
    local ok, infoOrCode, message = invokeGetter(warp,
      "getCurrentTargetInfo")
    if ok and type(infoOrCode) == "table"
        and type(infoOrCode.name) == "string"
        and #infoOrCode.name > 0 then
      values.orbit = cleanText(infoOrCode.name)
      values.orbitColor = colors.text
    elseif not ok and infoOrCode == "in_warp" then
      values.orbit = "IN WARP"
      values.orbitColor = colors.warning
      hasWarning = true
      diagnostics[#diagnostics + 1] = "in_warp"
    else
      values.orbit = "ERROR"
      values.orbitColor = colors.bad
      hasError = true
      if infoOrCode == "missing_method" then
        diagnostics[#diagnostics + 1] =
          "AdvancedRocketry API is too old"
      else
        diagnostics[#diagnostics + 1] = cleanText(infoOrCode or
          message or "invalid_target")
      end
    end
  end

  local altitude = controllers.altitude
  if not altitude.address then
    values.altitude = "ERROR"
    values.altitudeColor = colors.bad
    hasError = true
    diagnostics[#diagnostics + 1] = "altitude_controller not found"
  else
    local ok, valueOrCode = invokeGetter(altitude,
      "getCurrentAltitude")
    if ok and type(valueOrCode) == "number" then
      values.altitude = string.format("%.0f km", valueOrCode)
      values.altitudeColor = colors.text
    else
      values.altitude = "ERROR"
      values.altitudeColor = colors.bad
      hasError = true
      diagnostics[#diagnostics + 1] = cleanText(valueOrCode or
        "altitude_error")
    end
  end

  if hasError then
    defaultStatusText = table.concat(diagnostics, " | ")
    defaultStatusColor = colors.bad
  elseif hasWarning then
    defaultStatusText = table.concat(diagnostics, " | ")
    defaultStatusColor = colors.warning
  else
    defaultStatusText = "Ready"
    defaultStatusColor = colors.good
  end
end

local function programPath(program)
  return APP_DIRECTORY .. "/" .. program.file
end

local function refreshPrograms()
  for _, program in ipairs(programs) do
    local path = programPath(program)
    program.available = filesystem.exists(path)
      and not filesystem.isDirectory(path)
  end
end

local function drawInfoRow(y, label, value, valueColor)
  gpu.setBackground(colors.panel)
  gpu.fill(2, y, width - 2, 1, " ")
  local labelWidth = width >= 66 and 22 or 20
  writeAt(3, y, label, colors.muted, colors.panel, labelWidth - 1)
  writeAt(3 + labelWidth, y, value, valueColor, colors.panel,
    width - labelWidth - 4)
end

local function addButton(x, y, buttonWidth, index)
  local program = programs[index]
  local enabled = program.available == true
  local selected = selectedProgram == index
  local background = enabled and
    (selected and colors.panelActive or colors.button)
    or colors.buttonDisabled
  gpu.setBackground(background)
  gpu.fill(x, y, buttonWidth, 1, " ")
  local textColor = enabled and colors.buttonText or colors.muted
  local label = "[" .. index .. "] " .. program.label
  writeCentered(y, "", textColor, background)
  local clipped = cleanText(label)
  if #clipped > buttonWidth - 2 then
    clipped = string.sub(clipped, 1, math.max(1, buttonWidth - 5)) .. "..."
  end
  writeAt(x + math.max(1, math.floor((buttonWidth - #clipped) / 2)),
    y, clipped, textColor, background, buttonWidth - 1)
  buttons[#buttons + 1] = {
    x1 = x,
    x2 = x + buttonWidth - 1,
    y = y,
    index = index,
    enabled = enabled
  }
end

local function drawPrograms()
  writeAt(2, 5, "Applications", colors.accent)
  if width < 66 then
    for index = 1, #programs do
      addButton(2, 5 + index, width - 2, index)
    end
  else
    local gap = 1
    local buttonWidth = math.floor((width - 3 - gap) / 2)
    for index = 1, #programs do
      local column = index <= 4 and 0 or 1
      local row = column == 0 and index or index - 4
      local x = 2 + column * (buttonWidth + gap)
      addButton(x, 5 + row, buttonWidth, index)
    end
  end
end

local function drawStatusBar()
  if statusExpiresAt > 0 and computer.uptime() >= statusExpiresAt then
    statusExpiresAt = 0
  end
  local text = statusExpiresAt > 0 and statusText or defaultStatusText
  local color = statusExpiresAt > 0 and statusColor or defaultStatusColor
  clearLine(height - 1, colors.panel)
  writeCentered(height - 1, text, color, colors.panel)
  clearLine(height, colors.panel)
  writeCentered(height,
    "[1-7] Open   [Arrows/Enter] Select   [R] Rescan   [Q] Quit",
    colors.muted, colors.panel)
end

local function render()
  buttons = {}
  setColors(colors.text, colors.background)
  gpu.fill(1, 1, width, height, " ")
  writeCentered(1, APP_NAME .. "  v" .. APP_VERSION, colors.accent)
  drawInfoRow(2, "Minecraft Time", values.time, values.timeColor)
  drawInfoRow(3, "Orbiting Target", values.orbit, values.orbitColor)
  drawInfoRow(4, "Station Altitude", values.altitude,
    values.altitudeColor)
  drawPrograms()
  drawStatusBar()
end

local function launchProgram(index)
  local program = programs[index]
  if not program or not program.available then
    setStatus("Missing program: " ..
      (program and programPath(program) or tostring(index)), colors.bad, 8)
    return false
  end

  selectedProgram = index
  render()
  local called, success, reason = pcall(shell.execute,
    programPath(program))
  if not called then
    setStatus(program.label .. " failed: " .. cleanText(success),
      colors.bad, 8)
  elseif success == false or success == nil
      or (type(success) == "number" and success ~= 0) then
    setStatus(program.label .. " returned an error: " ..
      cleanText(reason or success), colors.bad, 8)
  else
    setStatus("Returned from " .. program.label, colors.good)
  end

  rescanControllers(false)
  refreshPrograms()
  refreshValues()
  return true
end

local function handleTouch(x, y)
  for index = #buttons, 1, -1 do
    local button = buttons[index]
    if y == button.y and x >= button.x1 and x <= button.x2 then
      selectedProgram = button.index
      if button.enabled then
        launchProgram(button.index)
      else
        setStatus("Missing program: " ..
          programPath(programs[button.index]), colors.bad, 8)
      end
      return true
    end
  end
  return false
end

local function moveSelectionVertical(delta)
  if width < 66 then
    selectedProgram = ((selectedProgram - 1 + delta) % #programs) + 1
    return
  end
  if selectedProgram <= 4 then
    selectedProgram = ((selectedProgram - 1 + delta) % 4) + 1
  else
    selectedProgram = 5 + ((selectedProgram - 5 + delta) % 3)
  end
end

local function moveSelectionHorizontal(delta)
  if width < 66 then
    moveSelectionVertical(delta)
  elseif delta > 0 and selectedProgram <= 4 then
    selectedProgram = math.min(7, selectedProgram + 4)
  elseif delta < 0 and selectedProgram >= 5 then
    selectedProgram = selectedProgram - 4
  end
end

local function handleKey(character, code)
  if character >= string.byte("1") and character <= string.byte("7") then
    launchProgram(character - string.byte("0"))
  elseif character == 13 or code == 28 then
    launchProgram(selectedProgram)
  elseif code == 200 then
    moveSelectionVertical(-1)
  elseif code == 208 then
    moveSelectionVertical(1)
  elseif code == 203 then
    moveSelectionHorizontal(-1)
  elseif code == 205 then
    moveSelectionHorizontal(1)
  elseif character == string.byte("r") or character == string.byte("R") then
    rescanControllers(true)
    refreshPrograms()
    refreshValues()
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
  refreshPrograms()
  rescanControllers(false)
  refreshValues()
  render()

  while running do
    local pulled, name, first, second, third = pcall(event.pull,
      REFRESH_SECONDS)
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
      rescanControllers(false)
    end

    if running then
      refreshValues()
      render()
    end
  end
end

local ok, errorMessage = xpcall(run, tostring)
restoreDisplay()
if not ok then
  io.stderr:write(cleanText(errorMessage) .. "\n")
  return 1
end

print(APP_NAME .. " closed.")
return 0
