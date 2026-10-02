-- AdvancedRocketry Continuation Rocket Monitoring Station GUI for OpenOS.
-- Minecraft 1.7.10 / OpenComputers 1.12.44-GTNH.

local component = require("component")
local computer = require("computer")
local event = require("event")

local APP_NAME = "Advanced Rocketry Rocket Monitor"
local APP_VERSION = "1.0.0"
local REFRESH_SECONDS = 1
local FUEL_REFRESH_SECONDS = 2
local FUEL_SUMMARY_REFRESH_SECONDS = 5
local LAUNCH_CONFIRM_SECONDS = 8

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

local monitor = {
  componentName = "monitoring_station",
  label = "Rocket Monitoring Station"
}

local tabs = {"Overview", "Rocket", "Fuel", "Mission"}
local fuelTypes = {"liquid", "nuclear", "ion", "warp", "impulse"}

local links = {
  rocket = false,
  mission = false,
  valid = false
}

local rocketCache = {
  data = nil,
  stale = false,
  error = nil,
  updatedAt = 0
}

local missionCache = {
  data = nil,
  stale = false,
  error = nil,
  updatedAt = 0,
  orbitHeight = nil
}

local fuelCache = {
  entries = {},
  updatedAt = 0,
  readyCount = nil,
  error = nil
}

local selectedTab = 1
local buttons = {}
local statusText = "Starting..."
local statusColor = colors.muted
local statusExpiresAt = 0
local launchArmedUntil = 0
local launchSubmitting = false
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

local function formatNumber(value, decimals)
  if type(value) ~= "number" then
    return "--"
  end
  return string.format("%." .. tostring(decimals) .. "f", value)
end

local function formatStat(value)
  if type(value) ~= "number" then
    return "--"
  end
  if math.abs(value - math.floor(value + 0.5)) < 0.00001 then
    return tostring(math.floor(value + 0.5))
  end
  return string.format("%.2f", value)
end

local function formatSigned(value, decimals)
  if type(value) ~= "number" then
    return "--"
  end
  return string.format("%+." .. tostring(decimals) .. "f", value)
end

local function formatDuration(seconds)
  if type(seconds) ~= "number" then
    return "--"
  end
  seconds = math.max(0, math.floor(seconds + 0.5))
  local days = math.floor(seconds / 86400)
  local hours = math.floor((seconds % 86400) / 3600)
  local minutes = math.floor((seconds % 3600) / 60)
  local remaining = seconds % 60
  if days > 0 then
    return string.format("%02d:%02d:%02d:%02d", days, hours, minutes,
      remaining)
  end
  return string.format("%02d:%02d:%02d", hours, minutes, remaining)
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

local function clearCaches()
  rocketCache.data = nil
  rocketCache.stale = false
  rocketCache.error = nil
  rocketCache.updatedAt = 0
  missionCache.data = nil
  missionCache.stale = false
  missionCache.error = nil
  missionCache.updatedAt = 0
  missionCache.orbitHeight = nil
  fuelCache.entries = {}
  fuelCache.updatedAt = 0
  fuelCache.readyCount = nil
  fuelCache.error = nil
end

local function cancelLaunch(showMessage)
  local wasArmed = launchArmedUntil > 0
  launchArmedUntil = 0
  launchSubmitting = false
  if wasArmed and showMessage then
    setStatus("Launch confirmation cancelled", colors.warning)
  end
end

local function disconnectMonitor(message)
  monitor.address = nil
  monitor.proxy = nil
  monitor.error = message
  links.rocket = false
  links.mission = false
  links.valid = false
  cancelLaunch(false)
  clearCaches()
end

local function handleCallError(code, message)
  if tostring(code) == "invalid_tile" then
    disconnectMonitor(tostring(code) .. ": " .. tostring(message))
  end
end

local function invokeGetter(method, ...)
  if not monitor.proxy or not monitor.address then
    return false, "not_connected", "Rocket Monitoring Station is not connected"
  end

  local invoked, first, second, third = pcall(
    component.invoke,
    monitor.address,
    method,
    ...
  )
  if not invoked then
    local reason = tostring(first)
    if isMissingMethod("", reason) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if first == nil then
    local code = tostring(second or "unknown_error")
    local message = tostring(third or "Getter failed")
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
  if not monitor.proxy or not monitor.address then
    return false, "not_connected", "Rocket Monitoring Station is not connected"
  end

  local invoked, success, valueOrCode, message = pcall(
    component.invoke,
    monitor.address,
    method,
    ...
  )
  if not invoked then
    local reason = tostring(success)
    if isMissingMethod("", reason) then
      return false, "missing_method", method .. " is not available"
    end
    return false, "oc_exception", reason
  end
  if success ~= true then
    local code = tostring(valueOrCode or "unknown_error")
    local detail = tostring(message or "Operation failed")
    handleCallError(code, detail)
    return false, code, detail
  end
  return true, valueOrCode
end

local function findMonitor()
  local ok, addressOrError = pcall(function()
    local iterator = component.list(monitor.componentName, true)
    return iterator()
  end)

  if not ok or not addressOrError then
    disconnectMonitor(ok and "not connected" or tostring(addressOrError))
    return false
  end

  local proxyOk, proxyOrError = pcall(component.proxy, addressOrError)
  if not proxyOk then
    disconnectMonitor(tostring(proxyOrError))
    return false
  end

  monitor.address = addressOrError
  monitor.proxy = proxyOrError
  monitor.error = nil
  links.valid = false
  return true
end

local function currentState()
  if not monitor.proxy then
    return "OFFLINE", colors.bad
  elseif not links.valid then
    return "CHECKING", colors.warning
  elseif links.rocket and links.mission then
    return "TRANSITION", colors.warning
  elseif links.rocket then
    return "ROCKET LINKED", colors.good
  elseif links.mission then
    return "MISSION ACTIVE", colors.accent
  end
  return "IDLE", colors.muted
end

local function refreshLinks(showErrors)
  if not monitor.proxy then
    links.valid = false
    return false
  end

  local rocketOk, rocketOrCode, rocketMessage =
    invokeGetter("isRocketLinked")
  if not rocketOk then
    cancelLaunch(false)
    links.valid = false
    local nextError = tostring(rocketOrCode) .. ": " .. tostring(rocketMessage)
    local changed = nextError ~= monitor.error
    monitor.error = nextError
    if showErrors or changed then
      setStatus("Link check failed - " .. monitor.error, colors.bad, 8)
    end
    return false
  end

  local missionOk, missionOrCode, missionMessage =
    invokeGetter("isMissionLinked")
  if not missionOk then
    cancelLaunch(false)
    links.valid = false
    local nextError = tostring(missionOrCode) .. ": " .. tostring(missionMessage)
    local changed = nextError ~= monitor.error
    monitor.error = nextError
    if showErrors or changed then
      setStatus("Link check failed - " .. monitor.error, colors.bad, 8)
    end
    return false
  end

  local newRocket = rocketOrCode == true
  local newMission = missionOrCode == true
  local changed = newRocket ~= links.rocket or newMission ~= links.mission

  links.rocket = newRocket
  links.mission = newMission
  links.valid = true
  monitor.error = nil

  if changed then
    cancelLaunch(false)
    if not newRocket then
      rocketCache.data = nil
      rocketCache.stale = false
      rocketCache.error = nil
      fuelCache.entries = {}
      fuelCache.updatedAt = 0
      fuelCache.readyCount = nil
      fuelCache.error = nil
    end
    if not newMission then
      missionCache.data = nil
      missionCache.stale = false
      missionCache.error = nil
      missionCache.orbitHeight = nil
    end
    local state = currentState()
    setStatus("Link state changed: " .. state, colors.accent)
  end
  return true
end

local function getRocketSnapshot()
  local ok, valueOrCode, message = invokeGetter("getRocketStatus")
  if ok then
    if type(valueOrCode) ~= "table" then
      return false, "invalid_response", "getRocketStatus did not return a table"
    end
    return true, valueOrCode
  elseif valueOrCode ~= "missing_method" then
    return false, valueOrCode, message
  end

  local getters = {
    height = "getRocketHeight",
    velocity = "getRocketVelocity",
    thrust = "getRocketThrust",
    weight = "getRocketWeight",
    drillingPower = "getDrillingPower",
    acceleration = "getAcceleration",
    hasSeat = "hasSeat"
  }
  local result = {alive = nil}
  for field, method in pairs(getters) do
    local fieldOk, fieldOrCode, fieldMessage = invokeGetter(method)
    if not fieldOk then
      return false, fieldOrCode, fieldMessage
    end
    result[field] = fieldOrCode
  end
  return true, result
end

local function refreshRocket(showErrors)
  if not links.rocket then
    rocketCache.data = nil
    rocketCache.stale = false
    rocketCache.error = nil
    return false
  end

  local ok, valueOrCode, message = getRocketSnapshot()
  if not ok then
    local nextError = tostring(valueOrCode) .. ": " .. tostring(message)
    local changed = nextError ~= rocketCache.error
    rocketCache.stale = rocketCache.data ~= nil
    rocketCache.error = nextError
    if valueOrCode == "rocket_not_found" then
      refreshLinks(false)
    elseif showErrors or changed then
      setStatus("Rocket telemetry failed - " .. rocketCache.error,
        colors.bad, 8)
    end
    return false
  end

  rocketCache.data = valueOrCode
  rocketCache.stale = false
  rocketCache.error = nil
  rocketCache.updatedAt = computer.uptime()
  return true
end

local function getMissionSnapshot()
  local ok, valueOrCode, message = invokeGetter("getMissionStatus")
  if ok then
    if type(valueOrCode) ~= "table" then
      return false, "invalid_response", "getMissionStatus did not return a table"
    end
    valueOrCode.missionId = cleanText(valueOrCode.missionId or "--")
    return true, valueOrCode
  elseif valueOrCode ~= "missing_method" then
    return false, valueOrCode, message
  end

  local progressOk, progressOrCode, progressMessage =
    invokeGetter("getMissionProgress")
  if not progressOk then
    return false, progressOrCode, progressMessage
  end
  local timeOk, timeOrCode, timeMessage =
    invokeGetter("getMissionRemainingTime")
  if not timeOk then
    return false, timeOrCode, timeMessage
  end
  return true, {
    missionId = "--",
    originDimension = nil,
    progress = progressOrCode,
    remainingSeconds = timeOrCode
  }
end

local function refreshMission(showErrors)
  if not links.mission then
    missionCache.data = nil
    missionCache.stale = false
    missionCache.error = nil
    missionCache.orbitHeight = nil
    return false
  end

  local ok, valueOrCode, message = getMissionSnapshot()
  if not ok then
    local nextError = tostring(valueOrCode) .. ": " .. tostring(message)
    local changed = nextError ~= missionCache.error
    missionCache.stale = missionCache.data ~= nil
    missionCache.error = nextError
    if valueOrCode == "mission_not_found" then
      refreshLinks(false)
    elseif showErrors or changed then
      setStatus("Mission telemetry failed - " .. missionCache.error,
        colors.bad, 8)
    end
    return false
  end

  missionCache.data = valueOrCode
  missionCache.stale = false
  missionCache.error = nil
  missionCache.updatedAt = computer.uptime()

  local heightOk, heightOrCode = invokeGetter("getRocketHeight")
  missionCache.orbitHeight = heightOk and heightOrCode or nil
  return true
end

local function getFuelSnapshot(fuelType)
  local ok, valueOrCode, message = invokeGetter("getFuelStatus", fuelType)
  if ok then
    if type(valueOrCode) ~= "table" then
      return false, "invalid_response", "getFuelStatus did not return a table"
    end
    return true, valueOrCode
  elseif valueOrCode ~= "missing_method" then
    return false, valueOrCode, message
  end

  local amountOk, amountOrCode, amountMessage =
    invokeGetter("getFuelAmount", fuelType)
  if not amountOk then
    return false, amountOrCode, amountMessage
  end
  local capacityOk, capacityOrCode, capacityMessage =
    invokeGetter("getFuelCapacity", fuelType)
  if not capacityOk then
    return false, capacityOrCode, capacityMessage
  end
  local rateOk, rateOrCode, rateMessage =
    invokeGetter("getFuelRate", fuelType)
  if not rateOk then
    return false, rateOrCode, rateMessage
  end
  return true, {
    type = fuelType,
    amount = amountOrCode,
    capacity = capacityOrCode,
    rate = rateOrCode
  }
end

local function refreshFuels(showErrors)
  if not links.rocket then
    fuelCache.entries = {}
    fuelCache.updatedAt = 0
    fuelCache.readyCount = nil
    fuelCache.error = nil
    return false
  end

  local readyCount = 0
  local hadError = false
  local firstError = nil
  for _, fuelType in ipairs(fuelTypes) do
    local oldEntry = fuelCache.entries[fuelType]
    local ok, valueOrCode, message = getFuelSnapshot(fuelType)
    if ok then
      local entry = valueOrCode
      entry.error = nil
      entry.stale = false
      fuelCache.entries[fuelType] = entry
      if type(entry.capacity) == "number" and entry.capacity > 0
          and type(entry.amount) == "number" and entry.amount > 0 then
        readyCount = readyCount + 1
      end
    else
      hadError = true
      firstError = firstError or
        (tostring(valueOrCode) .. ": " .. tostring(message))
      fuelCache.entries[fuelType] = oldEntry or {type = fuelType}
      fuelCache.entries[fuelType].error =
        tostring(valueOrCode) .. ": " .. tostring(message)
      fuelCache.entries[fuelType].stale = oldEntry ~= nil
      if valueOrCode == "rocket_not_found" then
        refreshLinks(false)
        break
      end
    end
  end

  fuelCache.updatedAt = computer.uptime()
  fuelCache.readyCount = readyCount
  local changed = firstError ~= fuelCache.error
  fuelCache.error = firstError
  if hadError and (showErrors or changed) then
    setStatus("One or more fuel readings failed", colors.warning, 8)
  end
  return not hadError
end

local function refreshCurrentPage(force)
  if not monitor.proxy then
    return
  end
  local now = computer.uptime()
  if selectedTab == 1 then
    if links.rocket then
      refreshRocket(false)
      if force or now - fuelCache.updatedAt >= FUEL_SUMMARY_REFRESH_SECONDS then
        refreshFuels(false)
      end
    elseif links.mission then
      refreshMission(false)
    end
  elseif selectedTab == 2 then
    refreshRocket(false)
  elseif selectedTab == 3 then
    if force or now - fuelCache.updatedAt >= FUEL_REFRESH_SECONDS then
      refreshFuels(false)
    end
  elseif selectedTab == 4 then
    refreshMission(false)
  end
end

local function reconnect(showMessage)
  cancelLaunch(false)
  clearCaches()
  local found = findMonitor()
  if not found then
    if showMessage then
      setStatus("Monitoring Station not connected", colors.warning, 8)
    end
    return false
  end

  if not refreshLinks(showMessage) then
    return false
  end
  refreshCurrentPage(true)
  if showMessage then
    local state = currentState()
    setStatus("Connected - " .. state, colors.good)
  end
  return true
end

local function launchAvailable()
  return selectedTab == 1
    and monitor.proxy ~= nil
    and links.valid
    and links.rocket
    and not links.mission
    and rocketCache.data ~= nil
    and rocketCache.data.alive == true
    and not rocketCache.stale
    and not launchSubmitting
end

local function armLaunch()
  if not launchAvailable() then
    setStatus("Launch request unavailable in the current state",
      colors.warning)
    return false
  end
  launchArmedUntil = computer.uptime() + LAUNCH_CONFIRM_SECONDS
  setStatus("Launch armed - confirm within 8 seconds", colors.warning,
    LAUNCH_CONFIRM_SECONDS)
  return true
end

local function confirmLaunch()
  if launchSubmitting then
    return false
  end
  if launchArmedUntil <= 0 or computer.uptime() > launchArmedUntil then
    cancelLaunch(false)
    setStatus("Launch confirmation expired", colors.warning)
    return false
  end
  if not launchAvailable() then
    cancelLaunch(false)
    setStatus("Launch request cancelled: rocket state changed", colors.warning)
    return false
  end

  launchSubmitting = true
  launchArmedUntil = 0
  local ok, valueOrCode, message = invokeMutator("prepareLaunch")
  launchSubmitting = false
  if not ok then
    setStatus("Launch request failed - " .. tostring(valueOrCode) ..
      ": " .. tostring(message), colors.bad, 8)
    refreshLinks(false)
    return false
  end

  setStatus("Launch request submitted", colors.good, 8)
  refreshLinks(false)
  refreshCurrentPage(true)
  return true
end

local function activateLaunch()
  if launchArmedUntil > 0 then
    return confirmLaunch()
  end
  return armLaunch()
end

local function addButton(x, y, label, handler, enabled, active)
  local text = " " .. label .. " "
  local foreground = enabled and colors.buttonText or colors.muted
  local background = active and colors.panelActive
    or (enabled and colors.button or colors.buttonDisabled)
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
    x = x + addButton(x, y, definition.label, definition.handler,
      definition.enabled ~= false, definition.active == true)
    if index < #definitions then
      x = x + 1
    end
  end
end

local function selectTab(index)
  if index < 1 or index > #tabs or index == selectedTab then
    return
  end
  cancelLaunch(false)
  selectedTab = index
  refreshCurrentPage(true)
end

local function drawTabs()
  clearLine(3, colors.panel)
  local definitions = {}
  for index, label in ipairs(tabs) do
    definitions[#definitions + 1] = {
      label = tostring(index) .. " " .. string.upper(label),
      active = selectedTab == index,
      handler = function() selectTab(index) end
    }
  end
  addButtonRow(3, definitions)
end

local function drawPageHeader(title, stale)
  clearLine(4, colors.panel)
  writeAt(2, 4, title, colors.accent, colors.panel)
  if stale then
    writeAt(math.max(1, width - 7), 4, "[STALE]", colors.warning,
      colors.panel)
  end
end

local function drawProgressBar(y, progress, label)
  progress = clamp(type(progress) == "number" and progress or 0, 0, 1)
  local barWidth = math.max(10, math.min(50, width - 6))
  local filled = math.floor((barWidth - 2) * progress + 0.5)
  local bar = "[" .. string.rep("#", filled) ..
    string.rep("-", barWidth - 2 - filled) .. "]"
  local x = math.floor((width - barWidth) / 2) + 1
  writeAt(x, y, bar, colors.accent)
  if label then
    writeCentered(y, label, colors.text)
  end
end

local function drawLinkLine()
  local rocketColor = links.rocket and colors.good or colors.muted
  local missionColor = links.mission and colors.accent or colors.muted
  writeAt(2, 5, "Rocket linked: " .. yesNo(links.rocket), rocketColor)
  writeAt(math.floor(width / 2) + 1, 5,
    "Mission linked: " .. yesNo(links.mission), missionColor)
end

local function drawUnavailable(title, detail, color)
  writeCentered(7, title, color or colors.warning)
  if detail then
    writeCentered(8, detail, colors.muted)
  end
end

local function drawLaunchControls()
  local y = height - 3
  local armed = launchArmedUntil > 0
  if armed then
    addButtonRow(y, {
      {
        label = "CONFIRM LAUNCH",
        enabled = launchAvailable(),
        handler = confirmLaunch
      },
      {
        label = "CANCEL",
        handler = function() cancelLaunch(true) end
      }
    })
  else
    addButtonRow(y, {
      {
        label = "ARM LAUNCH",
        enabled = launchAvailable(),
        handler = armLaunch
      }
    })
  end
end

local function drawOverview()
  drawPageHeader("OVERVIEW",
    rocketCache.stale or missionCache.stale)

  if not monitor.proxy then
    drawUnavailable("Monitoring Station: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not links.valid then
    drawUnavailable("Link state unavailable", monitor.error, colors.bad)
    return
  end

  drawLinkLine()
  if links.rocket then
    local data = rocketCache.data
    if not data then
      drawUnavailable("Live rocket telemetry unavailable", rocketCache.error,
        colors.warning)
    else
      writeAt(2, 6, "Height: " .. formatNumber(data.height, 2), colors.text)
      writeAt(math.floor(width / 2) + 1, 6,
        "Velocity: " .. formatSigned(data.velocity, 3), colors.text)
      writeAt(2, 7,
        "Acceleration: " .. formatNumber(data.acceleration, 3), colors.text)
      writeAt(math.floor(width / 2) + 1, 7,
        "Alive: " .. yesNo(data.alive),
        data.alive and colors.good or colors.warning)
      writeAt(2, 8,
        "Pilot seat: " .. (data.hasSeat and "INSTALLED" or "NONE"),
        data.hasSeat and colors.good or colors.muted)
      writeAt(math.floor(width / 2) + 1, 8,
        "Fuel tanks ready: " .. tostring(fuelCache.readyCount or "--") ..
          "/5", colors.text)
      if links.mission then
        writeCentered(10,
          "Rocket and mission are both linked during transition",
          colors.warning)
      elseif data.alive ~= true then
        writeCentered(10,
          "Launch disabled: a live rocket snapshot is required",
          colors.warning)
      else
        writeCentered(10,
          "Launch uses AdvancedRocketry's normal pre-launch checks",
          colors.muted)
      end
    end
    drawLaunchControls()
  elseif links.mission then
    local data = missionCache.data
    if not data then
      drawUnavailable("Mission telemetry unavailable", missionCache.error,
        colors.warning)
      return
    end
    local progress = clamp(tonumber(data.progress) or 0, 0, 1)
    writeAt(2, 6, "Mission ID: " .. cleanText(data.missionId or "--"),
      colors.text, colors.background, width - 3)
    writeAt(2, 7,
      "Origin dimension: " .. tostring(data.originDimension or "--"),
      colors.text)
    writeAt(2, 8,
      "Progress: " .. string.format("%.1f%%", progress * 100), colors.text)
    writeAt(math.floor(width / 2) + 1, 8,
      "Remaining: " .. formatDuration(data.remainingSeconds), colors.text)
    writeAt(2, 9,
      "Orbit estimate: " .. formatNumber(missionCache.orbitHeight, 2),
      colors.text)
    drawProgressBar(11, progress)
  else
    drawUnavailable("No rocket or mission is currently linked",
      "Link the Monitoring Station to a rocket to begin", colors.muted)
    writeCentered(10, "Component: " .. tostring(monitor.address),
      colors.muted)
  end
end

local function drawRocket()
  drawPageHeader("ROCKET TELEMETRY", rocketCache.stale)
  if not monitor.proxy then
    drawUnavailable("Monitoring Station: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not links.rocket then
    local detail = links.mission
      and "Rocket has transitioned to a mission"
      or "No live rocket is linked"
    drawUnavailable("Live rocket telemetry unavailable", detail,
      colors.warning)
    return
  end

  local data = rocketCache.data
  if not data then
    drawUnavailable("Live rocket telemetry unavailable", rocketCache.error,
      colors.warning)
    return
  end

  local right = math.floor(width / 2) + 1
  writeAt(2, 5, "Height: " .. formatNumber(data.height, 2), colors.text)
  writeAt(right, 5, "Velocity: " .. formatSigned(data.velocity, 3),
    colors.text)
  writeAt(2, 6, "Thrust: " .. formatStat(data.thrust), colors.text)
  writeAt(right, 6, "Weight: " .. formatStat(data.weight), colors.text)
  writeAt(2, 7, "Acceleration: " .. formatNumber(data.acceleration, 3),
    colors.text)
  writeAt(right, 7, "Drilling: " .. formatStat(data.drillingPower),
    colors.text)
  writeAt(2, 8,
    "Pilot seat: " .. (data.hasSeat and "INSTALLED" or "NONE"),
    data.hasSeat and colors.good or colors.muted)
  writeAt(right, 8, "Entity alive: " .. yesNo(data.alive),
    data.alive and colors.good or colors.warning)

  if type(data.weight) == "number" and data.weight > 0
      and type(data.thrust) == "number" then
    writeAt(2, 10,
      "Thrust / Weight: " .. formatNumber(data.thrust / data.weight, 3) ..
        "  (native stat ratio)", colors.accent)
  end
  writeAt(2, 12, "Acceleration uses native AdvancedRocketry units",
    colors.muted)
end

local function fuelFill(entry)
  if type(entry.amount) ~= "number" or type(entry.capacity) ~= "number"
      or entry.capacity <= 0 then
    return nil
  end
  return entry.amount / entry.capacity
end

local function fuelEndurance(entry)
  if type(entry.amount) ~= "number" or type(entry.rate) ~= "number"
      or entry.rate <= 0 then
    return nil
  end
  return entry.amount / entry.rate / 20
end

local function drawFuelRow(y, fuelType, entry)
  local background = y % 2 == 0 and colors.panel or colors.background
  clearLine(y, background)
  local label = string.upper(fuelType)

  if not entry then
    writeAt(1, y, label, colors.muted, background, 7)
    writeAt(9, y, "--", colors.muted, background)
    return
  end
  if entry.error and not entry.stale then
    writeAt(1, y, label, colors.bad, background, 7)
    writeAt(9, y, "API ERROR: " .. entry.error, colors.bad, background,
      width - 8)
    return
  end

  local capacity = tonumber(entry.capacity)
  local amount = tonumber(entry.amount)
  local rate = tonumber(entry.rate)
  if capacity and capacity <= 0 then
    writeAt(1, y, label, colors.muted, background, 7)
    writeAt(9, y, "NOT INSTALLED", colors.muted, background)
    return
  end

  local fill = fuelFill(entry)
  local fillColor = colors.muted
  if fill then
    if fill > 0.5 then
      fillColor = colors.good
    elseif fill >= 0.2 then
      fillColor = colors.warning
    else
      fillColor = colors.bad
    end
  end
  local pair = formatStat(amount) .. "/" .. formatStat(capacity)
  local percent = fill and string.format("%3.0f%%", clamp(fill, 0, 1) * 100)
    or " --%"
  local endurance = formatDuration(fuelEndurance(entry))

  writeAt(1, y, label, entry.stale and colors.warning or colors.text,
    background, 7)
  writeAt(9, y, pair, colors.text, background, width >= 70 and 17 or 14)
  if width >= 70 then
    writeAt(27, y, percent, fillColor, background, 5)
    writeAt(34, y, formatStat(rate), colors.text, background, 10)
    writeAt(46, y, endurance, colors.text, background, 12)
    local barWidth = math.max(8, width - 60)
    local filled = fill and math.floor((barWidth - 2) * clamp(fill, 0, 1) + 0.5)
      or 0
    local bar = "[" .. string.rep("#", filled) ..
      string.rep("-", barWidth - 2 - filled) .. "]"
    writeAt(60, y, bar, fillColor, background, barWidth)
  else
    writeAt(24, y, percent, fillColor, background, 5)
    writeAt(30, y, formatStat(rate), colors.text, background, 8)
    writeAt(39, y, endurance, colors.text, background, width - 38)
  end
end

local function drawFuel()
  local anyStale = false
  for _, entry in pairs(fuelCache.entries) do
    anyStale = anyStale or entry.stale == true
  end
  drawPageHeader("ROCKET FUEL", anyStale)

  if not monitor.proxy then
    drawUnavailable("Monitoring Station: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not links.rocket then
    local detail = links.mission
      and "Fuel telemetry ended when the rocket became a mission"
      or "No live rocket is linked"
    drawUnavailable("Fuel telemetry unavailable", detail, colors.warning)
    return
  end

  clearLine(5, colors.panel)
  if width >= 70 then
    writeAt(1, 5,
      "TYPE    AMOUNT/CAPACITY    FILL   RATE/t      ENDURANCE      LEVEL",
      colors.muted, colors.panel)
  else
    writeAt(1, 5, "TYPE    AMOUNT/CAP    FILL RATE/t   ENDURANCE",
      colors.muted, colors.panel)
  end
  for index, fuelType in ipairs(fuelTypes) do
    drawFuelRow(5 + index, fuelType, fuelCache.entries[fuelType])
  end
  writeAt(2, 12,
    "Endurance = amount / rate / 20; display estimate only",
    colors.muted, colors.background, width - 2)
end

local function drawMission()
  drawPageHeader("MISSION TELEMETRY", missionCache.stale)
  if not monitor.proxy then
    drawUnavailable("Monitoring Station: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not links.mission then
    local detail = links.rocket
      and "Mission telemetry appears after rocket transition"
      or "No mission is linked"
    drawUnavailable("No linked mission", detail, colors.muted)
    return
  end

  local data = missionCache.data
  if not data then
    drawUnavailable("Mission telemetry unavailable", missionCache.error,
      colors.warning)
    return
  end

  local missionId = cleanText(data.missionId or "--")
  local progress = clamp(tonumber(data.progress) or 0, 0, 1)
  writeAt(2, 5, "Mission ID: " .. missionId, colors.text,
    colors.background, width - 3)
  writeAt(2, 6,
    "Origin dimension: " .. tostring(data.originDimension or "--"),
    colors.text)
  writeAt(2, 7,
    "Progress: " .. string.format("%.1f%%", progress * 100), colors.text)
  writeAt(math.floor(width / 2) + 1, 7,
    "Remaining: " .. formatDuration(data.remainingSeconds), colors.text)
  drawProgressBar(9, progress,
    string.format("%.1f%%", progress * 100))
  writeAt(2, 11,
    "Orbit estimate: " .. formatNumber(missionCache.orbitHeight, 2),
    colors.text)
  if progress >= 1 then
    writeCentered(12, "Completing...", colors.warning)
  end
end

local function drawHeader()
  writeCentered(1, APP_NAME .. "  v" .. APP_VERSION, colors.accent)
  local state, stateColor = currentState()
  local summary = "Monitor [" .. shortAddress(monitor.address) .. "]  " ..
    state .. "  R:" .. (links.rocket and "Y" or "N") ..
    " M:" .. (links.mission and "Y" or "N")
  writeCentered(2, summary, stateColor)
end

local function drawStatusBar()
  local now = computer.uptime()
  if launchArmedUntil > 0 then
    local remaining = math.max(0, math.ceil(launchArmedUntil - now))
    statusText = "Launch armed - confirm within " .. remaining ..
      "s, or press C/Esc to cancel"
    statusColor = colors.warning
  elseif statusExpiresAt > 0 and now >= statusExpiresAt then
    statusText = "Ready"
    statusColor = colors.muted
    statusExpiresAt = 0
  end

  clearLine(height - 1, colors.panel)
  writeCentered(height - 1, statusText, statusColor, colors.panel)
  clearLine(height, colors.panel)
  local help = width >= 65
    and "[1-4] Tabs   [R] Rescan   [L] Launch   [C] Cancel   [Q] Quit"
    or "[1-4] Tabs  [R] Scan  [L] Launch  [Q] Quit"
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
    drawRocket()
  elseif selectedTab == 3 then
    drawFuel()
  else
    drawMission()
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
  if character >= string.byte("1") and character <= string.byte("4") then
    selectTab(character - string.byte("0"))
  elseif character == string.byte("r") or character == string.byte("R") then
    reconnect(true)
  elseif character == string.byte("l") or character == string.byte("L") then
    if selectedTab == 1 then
      activateLaunch()
    end
  elseif character == string.byte("c") or character == string.byte("C")
      or character == 27 or code == 1 then
    cancelLaunch(true)
  elseif character == 13 or code == 28 then
    if launchArmedUntil > 0 then
      confirmLaunch()
    end
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
  if monitor.proxy then
    local state = currentState()
    setStatus("Ready - " .. state, colors.good)
  else
    setStatus("Monitoring Station is not connected - press R after connecting",
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

    if launchArmedUntil > 0 and computer.uptime() > launchArmedUntil then
      cancelLaunch(false)
      setStatus("Launch confirmation expired", colors.warning)
    end

    if running then
      if monitor.proxy then
        refreshLinks(false)
      else
        findMonitor()
        if monitor.proxy then
          refreshLinks(false)
        end
      end
      refreshCurrentPage(false)
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
