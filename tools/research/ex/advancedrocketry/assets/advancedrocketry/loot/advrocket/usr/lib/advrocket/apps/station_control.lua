-- AdvancedRocketry Continuation station controller GUI for OpenOS.
-- Minecraft 1.7.10 / OpenComputers 1.12.44-GTNH.

local component = require("component")
local computer = require("computer")
local event = require("event")

local APP_NAME = "Advanced Rocketry Station Control"
local APP_VERSION = "1.0.1"
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

local controllers = {
  altitude = {
    componentName = "altitude_controller",
    label = "Altitude"
  },
  orientation = {
    componentName = "orientation_controller",
    label = "Orientation"
  },
  gravity = {
    componentName = "gravity_controller",
    label = "Gravity"
  }
}

local snapshots = {}
local drafts = {
  altitudeTarget = nil,
  altitudeRate = nil,
  yaw = nil,
  pitch = nil,
  gravity = nil
}
local dirty = {
  altitudeTarget = false,
  altitudeRate = false,
  yaw = false,
  pitch = false,
  gravity = false
}

local selectedTab = 1
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

local function clamp(value, minimum, maximum)
  return math.max(minimum, math.min(maximum, value))
end

local function quantize(value, minimum, maximum, step)
  local effective = minimum + math.floor(((value - minimum) / step) + 0.5) * step
  return clamp(effective, minimum, maximum)
end

local function formatNumber(value, decimals)
  if type(value) ~= "number" then
    return "--"
  end
  return string.format("%." .. tostring(decimals) .. "f", value)
end

local function shortAddress(address)
  if type(address) ~= "string" then
    return "--------"
  end
  return string.sub(address, 1, 8)
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
  local text = tostring(value or "")
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
  local text = tostring(value or "")
  if #text > width then
    text = string.sub(text, 1, width)
  end
  local x = math.floor((width - #text) / 2) + 1
  writeAt(x, y, text, foreground, background)
end

local function setStatus(message, color, duration)
  statusText = tostring(message or "")
  statusColor = color or colors.text
  statusExpiresAt = computer.uptime() + (duration or 5)
end

local function componentOnline(key)
  return controllers[key].proxy ~= nil
end

local function findController(controller)
  local ok, addressOrError = pcall(function()
    local iterator = component.list(controller.componentName, true)
    return iterator()
  end)

  if not ok or not addressOrError then
    controller.address = nil
    controller.proxy = nil
    controller.error = ok and "not connected" or tostring(addressOrError)
    return false
  end

  local proxyOk, proxyOrError = pcall(component.proxy, addressOrError)
  if not proxyOk then
    controller.address = nil
    controller.proxy = nil
    controller.error = tostring(proxyOrError)
    return false
  end

  controller.address = addressOrError
  controller.proxy = proxyOrError
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
    setStatus("Component scan complete: " .. found .. "/3 connected", found == 3 and colors.good or colors.warning)
  end
end

local function invokeGetter(controller, method, ...)
  if not controller.proxy or not controller.address then
    return false, "not_connected", controller.label .. " Controller is not connected"
  end

  local invoked, first, second, third = pcall(
    component.invoke,
    controller.address,
    method,
    ...
  )
  if not invoked then
    local reason = tostring(first)
    local lowerReason = string.lower(reason)
    if string.find(lowerReason, "no such method", 1, true)
        or string.find(lowerReason, "unknown method", 1, true) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if first == nil then
    local code = tostring(second or "unknown_error")
    local lowerCode = string.lower(code)
    if string.find(lowerCode, "no such method", 1, true)
        or string.find(lowerCode, "unknown method", 1, true) then
      return false, "missing_method", method .. " is not available"
    end
    return false, code, tostring(third or "Getter failed")
  end
  return true, first, second, third
end

local function invokeSetter(controller, method, ...)
  if not controller.proxy or not controller.address then
    return false, "not_connected", controller.label .. " Controller is not connected"
  end

  local invoked, success, valueOrCode, message = pcall(
    component.invoke,
    controller.address,
    method,
    ...
  )
  if not invoked then
    local reason = tostring(success)
    local lowerReason = string.lower(reason)
    if string.find(lowerReason, "no such method", 1, true)
        or string.find(lowerReason, "unknown method", 1, true) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if success ~= true then
    return false, tostring(valueOrCode or "unknown_error"), tostring(message or "Setter failed")
  end
  return true, valueOrCode
end

local function rememberError(controller, code, message)
  controller.error = tostring(code) .. ": " .. tostring(message)
  if code == "invalid_tile" then
    controller.proxy = nil
    controller.address = nil
  end
end

local function getAltitudeSnapshot(controller)
  local ok, valueOrCode, message = invokeGetter(controller, "getStatus")
  if ok or valueOrCode ~= "missing_method" then
    return ok, valueOrCode, message
  end

  local currentOk, currentOrCode, currentMessage =
    invokeGetter(controller, "getCurrentAltitude")
  if not currentOk then
    return false, currentOrCode, currentMessage
  end

  local targetOk, targetOrCode, targetMessage =
    invokeGetter(controller, "getTargetAltitude")
  if not targetOk then
    return false, targetOrCode, targetMessage
  end

  local rateOk, rateOrCode, rateMessage =
    invokeGetter(controller, "getChangeRateMultiplier")
  if not rateOk then
    return false, rateOrCode, rateMessage
  end

  local state = "idle"
  if math.abs(currentOrCode - targetOrCode) > 0.01 then
    state = currentOrCode < targetOrCode and "ascending" or "descending"
  end

  return true, {
    state = state,
    currentAltitude = currentOrCode,
    targetAltitude = targetOrCode,
    changeRateMultiplier = rateOrCode
  }
end

local function getOrientationSnapshot(controller)
  local ok, valueOrCode, message = invokeGetter(controller, "getOrientation")
  if ok or valueOrCode ~= "missing_method" then
    return ok, valueOrCode, message
  end

  local yawOk, yawOrCode, yawMessage = invokeGetter(controller, "getYaw")
  if not yawOk then
    return false, yawOrCode, yawMessage
  end

  local pitchOk, pitchOrCode, pitchMessage =
    invokeGetter(controller, "getPitch")
  if not pitchOk then
    return false, pitchOrCode, pitchMessage
  end

  return true, {
    targetYawRate = yawOrCode,
    targetPitchRate = pitchOrCode
  }
end

local function refreshSnapshots()
  local altitude = controllers.altitude
  if altitude.proxy then
    local ok, valueOrCode, message = getAltitudeSnapshot(altitude)
    if ok then
      snapshots.altitude = valueOrCode
      altitude.error = nil
      if not dirty.altitudeTarget then
        drafts.altitudeTarget = valueOrCode.targetAltitude
      end
      if not dirty.altitudeRate then
        drafts.altitudeRate = valueOrCode.changeRateMultiplier
      end
    else
      rememberError(altitude, valueOrCode, message)
    end
  else
    snapshots.altitude = nil
  end

  local orientation = controllers.orientation
  if orientation.proxy then
    local ok, valueOrCode, message = getOrientationSnapshot(orientation)
    if ok then
      snapshots.orientation = valueOrCode
      orientation.error = nil
      if not dirty.yaw then
        drafts.yaw = valueOrCode.targetYawRate
      end
      if not dirty.pitch then
        drafts.pitch = valueOrCode.targetPitchRate
      end
    else
      rememberError(orientation, valueOrCode, message)
    end
  else
    snapshots.orientation = nil
  end

  local gravity = controllers.gravity
  if gravity.proxy then
    local ok, valueOrCode, targetOrMessage, errorMessage = invokeGetter(gravity, "getGravityMultiplier")
    if ok then
      snapshots.gravity = {
        current = valueOrCode,
        target = targetOrMessage
      }
      gravity.error = nil
      if not dirty.gravity then
        drafts.gravity = targetOrMessage
      end
    else
      rememberError(gravity, valueOrCode, targetOrMessage or errorMessage)
    end
  else
    snapshots.gravity = nil
  end
end

local function setDraft(key, value, minimum, maximum, step)
  drafts[key] = quantize(value, minimum, maximum, step)
  dirty[key] = true
end

local function adjustDraft(key, delta, minimum, maximum, step)
  if type(drafts[key]) ~= "number" then
    setStatus("Wait for the controller status to load", colors.warning)
    return
  end
  setDraft(key, drafts[key] + delta, minimum, maximum, step)
end

local function applySetting(controllerKey, method, draftKey, label)
  local value = drafts[draftKey]
  if type(value) ~= "number" then
    setStatus(label .. " has no value to apply", colors.warning)
    return
  end

  local ok, valueOrCode, message = invokeSetter(controllers[controllerKey], method, value)
  if not ok then
    rememberError(controllers[controllerKey], valueOrCode, message)
    setStatus(label .. " failed - " .. valueOrCode .. ": " .. message, colors.bad, 8)
    return
  end

  drafts[draftKey] = valueOrCode
  dirty[draftKey] = false
  setStatus(label .. " applied: " .. tostring(valueOrCode), colors.good)
end

local function syncAltitudeDrafts()
  local snapshot = snapshots.altitude
  if not snapshot then
    setStatus("Altitude status is unavailable", colors.warning)
    return
  end
  drafts.altitudeTarget = snapshot.targetAltitude
  drafts.altitudeRate = snapshot.changeRateMultiplier
  dirty.altitudeTarget = false
  dirty.altitudeRate = false
  setStatus("Altitude controls synchronized", colors.accent)
end

local function syncOrientationDrafts()
  local snapshot = snapshots.orientation
  if not snapshot then
    setStatus("Orientation status is unavailable", colors.warning)
    return
  end
  drafts.yaw = snapshot.targetYawRate
  drafts.pitch = snapshot.targetPitchRate
  dirty.yaw = false
  dirty.pitch = false
  setStatus("Orientation controls synchronized", colors.accent)
end

local function syncGravityDraft()
  local snapshot = snapshots.gravity
  if not snapshot then
    setStatus("Gravity status is unavailable", colors.warning)
    return
  end
  drafts.gravity = snapshot.target
  dirty.gravity = false
  setStatus("Gravity control synchronized", colors.accent)
end

local function addButton(x, y, label, handler, enabled, active)
  local text = " " .. label .. " "
  local foreground = enabled and colors.buttonText or colors.muted
  local background = active and colors.panelActive or (enabled and colors.button or colors.buttonDisabled)
  writeAt(x, y, text, foreground, background)
  buttons[#buttons + 1] = {
    x1 = x,
    x2 = x + #text - 1,
    y = y,
    handler = handler,
    enabled = enabled
  }
  return #text
end

local function addButtonRow(y, definitions)
  local totalWidth = 0
  for index, definition in ipairs(definitions) do
    totalWidth = totalWidth + #definition.label + 2
    if index < #definitions then
      totalWidth = totalWidth + 1
    end
  end

  local x = math.max(1, math.floor((width - totalWidth) / 2) + 1)
  for index, definition in ipairs(definitions) do
    x = x + addButton(
      x,
      y,
      definition.label,
      definition.handler,
      definition.enabled ~= false,
      definition.active == true
    )
    if index < #definitions then
      x = x + 1
    end
  end
end

local function drawConnectionSummary()
  local parts = {}
  for _, key in ipairs({"altitude", "orientation", "gravity"}) do
    local controller = controllers[key]
    local state = controller.proxy and "ON" or "OFF"
    parts[#parts + 1] = string.sub(controller.label, 1, 1) .. ":" .. state
  end
  writeCentered(2, table.concat(parts, "   "), colors.muted)
end

local function drawTabs()
  addButtonRow(3, {
    {
      label = "1 Altitude",
      active = selectedTab == 1,
      handler = function() selectedTab = 1 end
    },
    {
      label = "2 Orientation",
      active = selectedTab == 2,
      handler = function() selectedTab = 2 end
    },
    {
      label = "3 Gravity",
      active = selectedTab == 3,
      handler = function() selectedTab = 3 end
    }
  })
end

local function drawControllerError(controller, y)
  if not controller.proxy then
    writeCentered(y, controller.label .. " Controller not connected", colors.bad)
    writeCentered(y + 1, "Connect it directly to the OC cable, then press R", colors.muted)
    return true
  end
  if controller.error then
    writeCentered(y, controller.label .. " error", colors.bad)
    writeCentered(y + 1, controller.error, colors.warning)
    return true
  end
  return false
end

local function drawAltitude()
  local controller = controllers.altitude
  if drawControllerError(controller, 6) or not snapshots.altitude then
    return
  end

  local snapshot = snapshots.altitude
  writeCentered(5, "ALTITUDE CONTROLLER  [" .. shortAddress(controller.address) .. "]", colors.accent)
  writeCentered(6,
    "Current: " .. formatNumber(snapshot.currentAltitude, 2) .. " km   State: " .. tostring(snapshot.state),
    colors.text)
  writeCentered(7,
    "Saved target: " .. formatNumber(snapshot.targetAltitude, 0) .. " km   Rate: x" .. formatNumber(snapshot.changeRateMultiplier, 1),
    colors.muted)

  writeCentered(9, "Target altitude draft: " .. formatNumber(drafts.altitudeTarget, 0) .. " km", colors.text)
  addButtonRow(10, {
    {label = "-2000", handler = function() adjustDraft("altitudeTarget", -2000, 2100, 40100, 200) end},
    {label = "-200", handler = function() adjustDraft("altitudeTarget", -200, 2100, 40100, 200) end},
    {label = "+200", handler = function() adjustDraft("altitudeTarget", 200, 2100, 40100, 200) end},
    {label = "+2000", handler = function() adjustDraft("altitudeTarget", 2000, 2100, 40100, 200) end},
    {label = "APPLY", handler = function()
      applySetting("altitude", "setTargetAltitude", "altitudeTarget", "Target altitude")
    end}
  })

  writeCentered(12, "Change-rate draft: x" .. formatNumber(drafts.altitudeRate, 1), colors.text)
  addButtonRow(13, {
    {label = "-1.0", handler = function() adjustDraft("altitudeRate", -1, 1, 10, 0.5) end},
    {label = "-0.5", handler = function() adjustDraft("altitudeRate", -0.5, 1, 10, 0.5) end},
    {label = "+0.5", handler = function() adjustDraft("altitudeRate", 0.5, 1, 10, 0.5) end},
    {label = "+1.0", handler = function() adjustDraft("altitudeRate", 1, 1, 10, 0.5) end},
    {label = "APPLY", handler = function()
      applySetting("altitude", "setChangeRateMultiplier", "altitudeRate", "Change-rate multiplier")
    end}
  })
  addButtonRow(14, {
    {label = "SYNC FROM CONTROLLER", handler = syncAltitudeDrafts}
  })
end

local function orientationButtons(key, method, label)
  return {
    {label = "-10", handler = function() adjustDraft(key, -10, -60, 60, 1) end},
    {label = "-1", handler = function() adjustDraft(key, -1, -60, 60, 1) end},
    {label = "ZERO", handler = function() setDraft(key, 0, -60, 60, 1) end},
    {label = "+1", handler = function() adjustDraft(key, 1, -60, 60, 1) end},
    {label = "+10", handler = function() adjustDraft(key, 10, -60, 60, 1) end},
    {label = "APPLY", handler = function()
      applySetting("orientation", method, key, label)
    end}
  }
end

local function drawOrientation()
  local controller = controllers.orientation
  if drawControllerError(controller, 6) or not snapshots.orientation then
    return
  end

  local snapshot = snapshots.orientation
  writeCentered(5, "ORIENTATION CONTROLLER  [" .. shortAddress(controller.address) .. "]", colors.accent)
  writeCentered(6,
    "Angles  Yaw: " .. formatNumber(snapshot.yaw, 1) .. " deg   Pitch: " .. formatNumber(snapshot.pitch, 1) .. " deg",
    colors.text)
  writeCentered(7,
    "Rates   Yaw: " .. formatNumber(snapshot.yawRate, 2) .. " r/h   Pitch: " .. formatNumber(snapshot.pitchRate, 2) .. " r/h",
    colors.muted)

  writeCentered(9, "Yaw / Y-axis target draft: " .. formatNumber(drafts.yaw, 0) .. " r/h", colors.text)
  addButtonRow(10, orientationButtons("yaw", "setYaw", "Yaw target"))

  writeCentered(12, "Pitch / X-axis target draft: " .. formatNumber(drafts.pitch, 0) .. " r/h", colors.text)
  addButtonRow(13, orientationButtons("pitch", "setPitch", "Pitch target"))
  addButtonRow(14, {
    {label = "SYNC FROM CONTROLLER", handler = syncOrientationDrafts}
  })
end

local function drawGravity()
  local controller = controllers.gravity
  if drawControllerError(controller, 6) or not snapshots.gravity then
    return
  end

  local snapshot = snapshots.gravity
  writeCentered(5, "GRAVITY CONTROLLER  [" .. shortAddress(controller.address) .. "]", colors.accent)
  writeCentered(6,
    "Current gravity: " .. formatNumber(snapshot.current, 3) .. " g",
    colors.text)
  writeCentered(7,
    "Saved target: " .. formatNumber(snapshot.target, 2) .. " g",
    colors.muted)

  writeCentered(9, "Target gravity draft: " .. formatNumber(drafts.gravity, 2) .. " g", colors.text)
  addButtonRow(10, {
    {label = "-0.10", handler = function() adjustDraft("gravity", -0.10, 0.10, 1.00, 0.01) end},
    {label = "-0.01", handler = function() adjustDraft("gravity", -0.01, 0.10, 1.00, 0.01) end},
    {label = "+0.01", handler = function() adjustDraft("gravity", 0.01, 0.10, 1.00, 0.01) end},
    {label = "+0.10", handler = function() adjustDraft("gravity", 0.10, 0.10, 1.00, 0.01) end},
    {label = "APPLY", handler = function()
      applySetting("gravity", "setGravityMultiplier", "gravity", "Gravity target")
    end}
  })

  writeCentered(12, "Presets", colors.muted)
  addButtonRow(13, {
    {label = "0.10", handler = function() setDraft("gravity", 0.10, 0.10, 1.00, 0.01) end},
    {label = "0.16", handler = function() setDraft("gravity", 0.16, 0.10, 1.00, 0.01) end},
    {label = "0.38", handler = function() setDraft("gravity", 0.38, 0.10, 1.00, 0.01) end},
    {label = "1.00", handler = function() setDraft("gravity", 1.00, 0.10, 1.00, 0.01) end},
    {label = "APPLY", handler = function()
      applySetting("gravity", "setGravityMultiplier", "gravity", "Gravity target")
    end}
  })
  addButtonRow(14, {
    {label = "SYNC FROM CONTROLLER", handler = syncGravityDraft}
  })
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
  writeCentered(height, "[1-3] Tabs   [R] Rescan   [Q] Quit   Touch supported", colors.muted, colors.panel)
end

local function render()
  buttons = {}
  setColors(colors.text, colors.background)
  gpu.fill(1, 1, width, height, " ")

  writeCentered(1, APP_NAME .. "  v" .. APP_VERSION, colors.accent)
  drawConnectionSummary()
  drawTabs()
  clearLine(4, colors.panel)

  if selectedTab == 1 then
    drawAltitude()
  elseif selectedTab == 2 then
    drawOrientation()
  else
    drawGravity()
  end
  drawStatusBar()
end

local function handleTouch(x, y)
  for index = #buttons, 1, -1 do
    local button = buttons[index]
    if button.enabled and y == button.y and x >= button.x1 and x <= button.x2 then
      button.handler()
      return true
    end
  end
  return false
end

local function handleKey(character)
  if character == string.byte("1") then
    selectedTab = 1
  elseif character == string.byte("2") then
    selectedTab = 2
  elseif character == string.byte("3") then
    selectedTab = 3
  elseif character == string.byte("r") or character == string.byte("R") then
    rescanControllers(true)
    refreshSnapshots()
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
  rescanControllers(false)
  refreshSnapshots()
  local connected = 0
  for _, controller in pairs(controllers) do
    if controller.proxy then
      connected = connected + 1
    end
  end
  setStatus("Ready - " .. connected .. "/3 controllers connected", connected == 3 and colors.good or colors.warning)
  render()

  while running do
    local pulled, name, first, second, third = pcall(event.pull, REFRESH_SECONDS)
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
      handleKey(second)
    elseif name == "component_added" or name == "component_removed" then
      rescanControllers(false)
    end

    if running then
      refreshSnapshots()
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
