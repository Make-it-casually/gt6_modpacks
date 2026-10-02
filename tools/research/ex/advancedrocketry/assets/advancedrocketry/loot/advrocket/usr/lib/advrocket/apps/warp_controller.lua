-- AdvancedRocketry Continuation Warp Controller GUI for OpenOS.
-- Minecraft 1.7.10 / OpenComputers 1.12.44-GTNH.

local component = require("component")
local computer = require("computer")
local event = require("event")

local APP_NAME = "Advanced Rocketry Warp Control"
local APP_VERSION = "1.1.0"
local REFRESH_SECONDS = 1
local WARP_CONFIRM_SECONDS = 8
local MIN_TARGET_ID = -2147483648
local MAX_TARGET_ID = 2147483647

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

local controller = {
  componentName = "warp_controller",
  label = "Warp Controller"
}

local tabs = {"Overview", "Destination"}
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

local destinationDraft = nil
local destinationDirty = false
local destinationEditing = false
local destinationBuffer = ""
local replaceEditOnType = false

local warpArmedUntil = 0
local armedStationId = nil
local armedDestinationId = nil
local warpSubmitting = false
local warpInitialTicks = 0

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

local reasonLabels = {
  ready = "All warp requirements satisfied",
  already_in_warp = "Station is already in warp",
  invalid_destination = "Destination is invalid",
  same_destination = "Destination matches current orbit",
  unknown_destination = "Destination has not been discovered",
  invalid_travel_cost = "No finite route is available",
  no_usable_warp_core = "No usable Warp Core is available",
  insufficient_fuel = "Insufficient warp fuel",
  missing_artifacts = "Required destination artifacts are missing",
  not_on_station = "Controller is not on a valid station",
  invalid_tile = "Controller is no longer available"
}

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

local function formatTicks(ticks)
  if type(ticks) ~= "number" then
    return "--"
  end
  local totalSeconds = math.max(0, math.ceil(ticks / 20))
  local minutes = math.floor(totalSeconds / 60)
  local seconds = totalSeconds % 60
  if minutes > 0 then
    return string.format("%dm %02ds", minutes, seconds)
  end
  return tostring(seconds) .. "s"
end

local function yesNo(value)
  if value == true then
    return "YES"
  elseif value == false then
    return "NO"
  end
  return "--"
end

local function friendlyReason(reason)
  local code = tostring(reason or "unknown")
  return reasonLabels[code] or code:gsub("_", " ")
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

local function cancelWarp(showMessage)
  local wasArmed = warpArmedUntil > 0
  warpArmedUntil = 0
  armedStationId = nil
  armedDestinationId = nil
  warpSubmitting = false
  if wasArmed and showMessage then
    setStatus("Warp confirmation cancelled", colors.warning)
  end
end

local function cancelDestinationEdit(showMessage)
  if not destinationEditing then
    return
  end
  destinationEditing = false
  destinationBuffer = ""
  replaceEditOnType = false
  if showMessage then
    setStatus("Destination edit cancelled", colors.warning)
  end
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

local function disconnectController(message)
  controller.address = nil
  controller.proxy = nil
  controller.error = message
  snapshot = nil
  snapshotStale = false
  clearInfoCaches()
  warpInitialTicks = 0
  cancelWarp(false)
  cancelDestinationEdit(false)
end

local function handleCallError(code, message)
  if tostring(code) == "invalid_tile" then
    disconnectController(tostring(code) .. ": " .. tostring(message))
  end
end

local function invokeGetter(method, ...)
  if not controller.proxy or not controller.address then
    return false, "not_connected", "Warp Controller is not connected"
  end

  local invoked, first, second, third = pcall(
    component.invoke,
    controller.address,
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
    local message = tostring(third or "Warp Controller call failed")
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
  if not controller.proxy or not controller.address then
    return false, "not_connected", "Warp Controller is not connected"
  end

  local invoked, success, valueOrCode, message = pcall(
    component.invoke,
    controller.address,
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
    local detail = tostring(message or "Warp Controller operation failed")
    handleCallError(code, detail)
    return false, code, detail
  end
  return true, valueOrCode, message
end

local function findController()
  local ok, addressOrError = pcall(function()
    local iterator = component.list(controller.componentName, true)
    return iterator()
  end)

  if not ok or not addressOrError then
    disconnectController(ok and "not connected" or tostring(addressOrError))
    return false
  end

  local proxyOk, proxyOrError = pcall(component.proxy, addressOrError)
  if not proxyOk then
    disconnectController(tostring(proxyOrError))
    return false
  end

  controller.address = addressOrError
  controller.proxy = proxyOrError
  controller.error = nil
  snapshotStale = false
  return true
end

local function getFallbackSnapshot()
  local warpOk, inWarpOrCode, warpMessage = invokeGetter("isInWarp")
  if not warpOk then
    return false, inWarpOrCode, warpMessage
  end

  local destinationOk, destinationOrCode, destinationMessage =
    invokeGetter("getDestination")
  if not destinationOk then
    return false, destinationOrCode, destinationMessage
  end

  local fuelOk, fuelOrCode, fuelMessage = invokeGetter("getFuelAmount")
  if not fuelOk then
    return false, fuelOrCode, fuelMessage
  end

  local readyOk, readyOrCode, reasonOrMessage = invokeGetter("canWarp")
  if not readyOk then
    return false, readyOrCode, reasonOrMessage
  end

  local currentTarget = nil
  if not inWarpOrCode then
    local currentOk, currentOrCode, currentMessage =
      invokeGetter("getCurrentPlanet")
    if not currentOk then
      return false, currentOrCode, currentMessage
    end
    currentTarget = currentOrCode
  end

  local travelCost = -1
  local costOk, costOrCode, costMessage = invokeGetter("getTravelCost")
  if costOk then
    travelCost = costOrCode
  elseif tostring(costOrCode) ~= "invalid_travel_cost" then
    return false, costOrCode, costMessage
  end

  return true, {
    stationId = nil,
    currentTargetId = currentTarget,
    destinationTargetId = destinationOrCode,
    inWarp = inWarpOrCode == true,
    travelCost = travelCost,
    fuelAmount = fuelOrCode,
    fuelCapacity = nil,
    hasUsableWarpCore = nil,
    hasRequiredArtifacts = nil,
    canWarp = readyOrCode == true,
    reason = tostring(reasonOrMessage or "unknown"),
    remainingTicks = 0
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

local function readCurrentTargetInfo()
  local ok, valueOrCode, message = invokeGetter("getCurrentTargetInfo")
  if not ok then
    return nil, tostring(valueOrCode) .. ": " .. tostring(message)
  end
  if type(valueOrCode) ~= "table" then
    return nil, "invalid_response: current target info is not a table"
  end
  return valueOrCode, nil
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
    currentInfo, currentInfoError = readCurrentTargetInfo()
    currentInfoId = currentId
  end

  local destinationId = snapshot.destinationTargetId
  if force or destinationInfoId ~= destinationId then
    destinationInfo, destinationInfoError = readTargetInfo(destinationId)
    destinationInfoId = destinationId
  end

  if force or draftInfoId ~= destinationDraft then
    draftInfo, draftInfoError = readTargetInfo(destinationDraft)
    draftInfoId = destinationDraft
  end
end

local function updateDraftInfo()
  draftInfo, draftInfoError = readTargetInfo(destinationDraft)
  draftInfoId = destinationDraft
end

local function syncDraftFromSnapshot()
  if snapshot and not destinationDirty and not destinationEditing
      and type(snapshot.destinationTargetId) == "number" then
    destinationDraft = snapshot.destinationTargetId
  end
end

local function validateArmedState(previous)
  if warpArmedUntil <= 0 or not snapshot then
    return
  end
  local stationChanged = armedStationId ~= nil
    and snapshot.stationId ~= armedStationId
  local destinationChanged = snapshot.destinationTargetId
    ~= armedDestinationId
  if stationChanged or destinationChanged or snapshot.inWarp
      or snapshot.canWarp ~= true then
    cancelWarp(false)
    local detail = destinationChanged and "destination changed"
      or stationChanged and "station changed"
      or snapshot.inWarp and "warp already started"
      or "station is no longer ready"
    setStatus("Warp confirmation cancelled - " .. detail, colors.warning, 7)
  elseif previous and previous.destinationTargetId
      ~= snapshot.destinationTargetId then
    cancelWarp(false)
    setStatus("Warp confirmation cancelled - destination changed",
      colors.warning, 7)
  end
end

local function refreshSnapshot(showErrors, forceInfo)
  if not controller.proxy then
    snapshot = nil
    snapshotStale = false
    return false
  end

  local previous = snapshot
  local ok, valueOrCode, message = getSnapshot()
  if not ok then
    controller.error = tostring(valueOrCode) .. ": " .. tostring(message)
    snapshotStale = snapshot ~= nil
    if showErrors then
      setStatus("Status refresh failed - " .. controller.error,
        colors.bad, 8)
    end
    return false
  end

  snapshot = valueOrCode
  snapshotStale = false
  controller.error = nil
  if snapshot.inWarp then
    local remaining = tonumber(snapshot.remainingTicks) or 0
    if not previous or not previous.inWarp or remaining > warpInitialTicks then
      warpInitialTicks = remaining
    end
  else
    warpInitialTicks = 0
  end
  validateArmedState(previous)
  syncDraftFromSnapshot()
  refreshInfoCaches(forceInfo == true)
  return true
end

local function reconnect(showMessage)
  cancelWarp(false)
  cancelDestinationEdit(false)
  local found = findController()
  if found then
    refreshSnapshot(false, true)
  end
  if showMessage then
    if found then
      setStatus("Warp Controller connected [" ..
        shortAddress(controller.address) .. "]", colors.good)
    else
      setStatus("Warp Controller not found", colors.warning, 7)
    end
  end
end

local function stateLabel()
  if not controller.proxy then
    return "OFFLINE", colors.bad
  elseif not snapshot then
    return "CHECKING", colors.warning
  elseif snapshot.inWarp then
    return "IN WARP", colors.accent
  elseif snapshot.canWarp then
    return "READY", colors.good
  end
  return "BLOCKED", colors.warning
end

local function beginDestinationEdit()
  cancelWarp(false)
  destinationEditing = true
  destinationBuffer = destinationDraft ~= nil
    and formatInteger(destinationDraft) or ""
  replaceEditOnType = true
  setStatus("Editing target ID - type a number, then press Enter",
    colors.accent, 30)
end

local function parseDestinationBuffer()
  if destinationBuffer == "" or destinationBuffer == "-" then
    return nil
  end
  local value = tonumber(destinationBuffer)
  if not value or value ~= math.floor(value) then
    return nil
  end
  return clamp(value, MIN_TARGET_ID, MAX_TARGET_ID)
end

local function saveDestinationEdit()
  local value = parseDestinationBuffer()
  if value == nil then
    setStatus("Enter a valid integer target ID", colors.bad, 7)
    return false
  end
  destinationDraft = value
  destinationDirty = not snapshot
    or value ~= snapshot.destinationTargetId
  destinationEditing = false
  destinationBuffer = ""
  replaceEditOnType = false
  updateDraftInfo()
  setStatus("Destination draft updated - press APPLY to commit",
    colors.accent)
  return true
end

local function setDestinationDraft(value)
  if destinationEditing then
    return
  end
  local base = destinationDraft
  if type(base) ~= "number" then
    base = snapshot and snapshot.destinationTargetId or 0
  end
  destinationDraft = clamp(math.floor(value or base),
    MIN_TARGET_ID, MAX_TARGET_ID)
  destinationDirty = not snapshot
    or destinationDraft ~= snapshot.destinationTargetId
  cancelWarp(false)
  updateDraftInfo()
end

local function adjustDestination(amount)
  local base = type(destinationDraft) == "number" and destinationDraft
    or snapshot and snapshot.destinationTargetId or 0
  setDestinationDraft(base + amount)
end

local function syncDestination(showMessage)
  cancelWarp(false)
  cancelDestinationEdit(false)
  destinationDirty = false
  destinationDraft = snapshot and snapshot.destinationTargetId or nil
  updateDraftInfo()
  if showMessage then
    setStatus("Destination draft synchronized", colors.good)
  end
end

local function applyDestination()
  if destinationEditing then
    setStatus("Finish editing the target ID before applying", colors.warning)
    return
  end
  if type(destinationDraft) ~= "number" then
    setStatus("No valid destination draft", colors.bad)
    return
  end
  cancelWarp(false)
  local ok, valueOrCode, message = invokeMutator(
    "setDestination", destinationDraft)
  if not ok then
    setStatus("Destination rejected - " .. tostring(valueOrCode) ..
      ": " .. tostring(message), colors.bad, 9)
    return
  end
  destinationDraft = valueOrCode
  destinationDirty = false
  refreshSnapshot(false, true)
  local name = destinationInfo and destinationInfo.name
    or ("Target " .. formatInteger(valueOrCode))
  setStatus("Destination committed: " .. cleanText(name) .. " [" ..
    formatInteger(valueOrCode) .. "]", colors.good)
end

local function armWarp()
  if warpSubmitting then
    return
  end
  if not snapshot then
    setStatus("Warp status is unavailable", colors.bad)
    return
  end
  if snapshot.inWarp then
    setStatus("Station is already in warp", colors.warning)
    return
  end
  if snapshot.canWarp ~= true then
    setStatus("Cannot warp - " .. friendlyReason(snapshot.reason),
      colors.warning, 8)
    return
  end
  armedStationId = snapshot.stationId
  armedDestinationId = snapshot.destinationTargetId
  warpArmedUntil = computer.uptime() + WARP_CONFIRM_SECONDS
  setStatus("Warp armed for target " .. formatInteger(armedDestinationId) ..
    " - confirm within " .. WARP_CONFIRM_SECONDS .. "s", colors.warning,
    WARP_CONFIRM_SECONDS)
end

local function confirmWarp()
  if warpSubmitting then
    return
  end
  if warpArmedUntil <= 0 or computer.uptime() > warpArmedUntil then
    cancelWarp(false)
    setStatus("Warp confirmation expired", colors.warning)
    return
  end

  if not refreshSnapshot(false) or warpArmedUntil <= 0 then
    if warpArmedUntil > 0 then
      cancelWarp(false)
      setStatus("Warp cancelled - latest status is unavailable", colors.bad)
    end
    return
  end
  if not snapshot or snapshot.inWarp or snapshot.canWarp ~= true
      or snapshot.destinationTargetId ~= armedDestinationId
      or (armedStationId ~= nil and snapshot.stationId ~= armedStationId) then
    cancelWarp(false)
    setStatus("Warp cancelled - station state changed", colors.warning, 7)
    return
  end

  warpSubmitting = true
  local expected = armedDestinationId
  local ok, destinationOrCode, remainingOrMessage = invokeMutator(
    "warp", expected)
  warpSubmitting = false
  cancelWarp(false)
  if not ok then
    setStatus("Warp rejected - " .. tostring(destinationOrCode) ..
      ": " .. tostring(remainingOrMessage), colors.bad, 9)
    refreshSnapshot(false)
    return
  end

  warpInitialTicks = tonumber(remainingOrMessage) or 0
  setStatus("Warp started to target " .. formatInteger(destinationOrCode) ..
    " - ETA " .. formatTicks(remainingOrMessage), colors.good, 8)
  refreshSnapshot(false)
end

local function activateWarp()
  if warpArmedUntil > 0 then
    confirmWarp()
  else
    armWarp()
  end
end

local function selectTab(index)
  if index < 1 or index > #tabs or index == selectedTab then
    return
  end
  cancelWarp(false)
  cancelDestinationEdit(false)
  selectedTab = index
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
  table.insert(buttons, {
    x1 = x,
    x2 = x + buttonWidth - 1,
    y = y,
    enabled = enabled,
    handler = handler
  })
end

local function drawTabs()
  local firstWidth = math.floor(width / 2)
  drawButton(1, 3, firstWidth, tabs[1], true,
    function() selectTab(1) end, selectedTab == 1)
  drawButton(firstWidth + 1, 3, width - firstWidth, tabs[2], true,
    function() selectTab(2) end, selectedTab == 2)
end

local function drawPageHeader(label)
  clearLine(4, colors.panel)
  local suffix = snapshotStale and "  [STALE]" or ""
  writeAt(2, 4, label .. suffix,
    snapshotStale and colors.warning or colors.accent, colors.panel,
    width - 2)
end

local function drawProgressBar(y, fraction, foreground)
  local barWidth = math.max(1, width - 4)
  fraction = clamp(tonumber(fraction) or 0, 0, 1)
  gpu.setBackground(colors.panel)
  gpu.fill(3, y, barWidth, 1, " ")
  local filled = math.floor(barWidth * fraction + 0.5)
  if filled > 0 then
    gpu.setBackground(foreground or colors.accent)
    gpu.fill(3, y, filled, 1, " ")
  end
end

local function drawUnavailable(title, detail, color)
  writeCentered(7, title, color or colors.warning)
  if detail then
    writeCentered(9, detail, colors.muted)
  end
end

local function drawOverview()
  drawPageHeader("WARP STATUS")
  if not controller.proxy then
    drawUnavailable("Warp Controller: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Warp status unavailable", controller.error,
      colors.warning)
    return
  end

  local state, stateColor = stateLabel()
  writeAt(2, 5, "Station: " .. formatInteger(snapshot.stationId),
    colors.text)
  writeAt(math.floor(width / 2) + 1, 5, "State: " .. state,
    stateColor)
  writeAt(2, 6, "Current: " ..
    targetName(currentInfo, snapshot.currentTargetId),
    currentInfo and colors.text or colors.warning,
    colors.background, math.floor(width / 2) - 1)
  writeAt(math.floor(width / 2) + 1, 6,
    "Destination: " ..
      targetName(destinationInfo, snapshot.destinationTargetId),
    destinationInfo and colors.text or colors.warning,
    colors.background, width - math.floor(width / 2) - 1)

  local fuel = tonumber(snapshot.fuelAmount)
  local capacity = tonumber(snapshot.fuelCapacity)
  local cost = tonumber(snapshot.travelCost)
  local fuelText = "Fuel: " .. formatInteger(fuel)
  if capacity and capacity > 0 then
    fuelText = fuelText .. "/" .. formatInteger(capacity)
  end
  local costText = "Cost: " .. (cost and cost > 0
    and formatInteger(cost) or "--")
  if fuel and cost and cost > 0 then
    costText = costText .. "  Reserve: " .. formatInteger(fuel - cost)
  end
  writeAt(2, 7, fuelText, colors.text, colors.background,
    math.floor(width / 2) - 1)
  writeAt(math.floor(width / 2) + 1, 7, costText,
    fuel and cost and cost > fuel and colors.bad or colors.text,
    colors.background, width - math.floor(width / 2) - 1)

  if capacity and capacity > 0 and fuel then
    drawProgressBar(8, fuel / capacity,
      cost and cost > fuel and colors.bad or colors.accent)
  else
    writeCentered(8, "Fuel capacity unavailable", colors.muted)
  end

  writeAt(2, 9, "ID " .. formatInteger(snapshot.currentTargetId) ..
    "  " .. targetKind(currentInfo), colors.muted,
    colors.background, math.floor(width / 2) - 1)
  writeAt(math.floor(width / 2) + 1, 9,
    "ID " .. formatInteger(snapshot.destinationTargetId) ..
      "  " .. targetKind(destinationInfo), colors.muted,
    colors.background, width - math.floor(width / 2) - 1)

  writeAt(2, 10, "Warp Core: " .. yesNo(snapshot.hasUsableWarpCore),
    snapshot.hasUsableWarpCore == false and colors.bad or colors.text)
  writeAt(math.floor(width / 2) + 1, 10,
    "Artifacts: " .. yesNo(snapshot.hasRequiredArtifacts),
    snapshot.hasRequiredArtifacts == false and colors.bad or colors.text)

  if snapshot.inWarp then
    local remaining = tonumber(snapshot.remainingTicks) or 0
    writeAt(2, 11, "Remaining: " .. formatInteger(remaining) ..
      " ticks / " .. formatTicks(remaining), colors.accent,
      colors.background, width - 2)
    if warpInitialTicks > 0 then
      drawProgressBar(12, 1 - (remaining / warpInitialTicks), colors.good)
    end
  else
    writeAt(2, 11, "Readiness: " .. friendlyReason(snapshot.reason),
      snapshot.canWarp and colors.good or colors.warning,
      colors.background, width - 2)
  end

  local actionY = height - 3
  if snapshot.inWarp then
    drawButton(math.floor((width - 18) / 2) + 1, actionY, 18,
      "WARP IN PROGRESS", false, function() end)
  elseif warpArmedUntil > 0 then
    local confirmWidth = 18
    local cancelWidth = 12
    local startX = math.floor((width - confirmWidth - cancelWidth - 1) / 2) + 1
    drawButton(startX, actionY, confirmWidth, "CONFIRM WARP", true,
      confirmWarp, true)
    drawButton(startX + confirmWidth + 1, actionY, cancelWidth,
      "CANCEL", true, function() cancelWarp(true) end)
  else
    drawButton(math.floor((width - 16) / 2) + 1, actionY, 16,
      "ARM WARP", snapshot.canWarp == true, armWarp)
  end
end

local function drawAdjustmentButtons(y)
  local definitions = {
    {"-100", -100}, {"-10", -10}, {"-1", -1},
    {"+1", 1}, {"+10", 10}, {"+100", 100}
  }
  local buttonWidth = width >= 66 and 8 or 6
  local gap = 1
  local totalWidth = #definitions * buttonWidth +
    (#definitions - 1) * gap
  local x = math.floor((width - totalWidth) / 2) + 1
  for _, definition in ipairs(definitions) do
    local amount = definition[2]
    drawButton(x, y, buttonWidth, definition[1],
      not destinationEditing,
      function() adjustDestination(amount) end)
    x = x + buttonWidth + gap
  end
end

local function drawDestination()
  drawPageHeader("DESTINATION CONTROL")
  if not controller.proxy then
    drawUnavailable("Warp Controller: OFFLINE",
      "Connect it to the OC network, then press R", colors.bad)
    return
  end
  if not snapshot then
    drawUnavailable("Destination status unavailable", controller.error,
      colors.warning)
    return
  end

  local half = math.floor(width / 2)
  writeAt(2, 5, "Current: " ..
    targetName(currentInfo, snapshot.currentTargetId),
    currentInfo and colors.text or colors.warning,
    colors.background, half - 1)
  writeAt(half + 1, 5, "Committed: " ..
    targetName(destinationInfo, snapshot.destinationTargetId),
    destinationInfo and colors.text or colors.warning,
    colors.background, width - half - 1)

  local shownDraft = destinationEditing and destinationBuffer
    or formatInteger(destinationDraft)
  local draftColor = destinationEditing and colors.accent
    or destinationDirty and colors.warning or colors.good
  clearLine(6, colors.panel)
  writeCentered(6, "TARGET ID  " .. shownDraft,
    draftColor, colors.panel)

  if destinationEditing then
    writeCentered(7, "Finish editing the ID to resolve its target name",
      colors.accent)
  else
    local previewColor = draftInfo and draftInfo.known and colors.good
      or draftInfo and colors.warning or colors.bad
    writeCentered(7, draftInfo and targetName(draftInfo, destinationDraft)
      or "Unresolved target", previewColor)
  end

  local detail = destinationEditing
    and "Type integer ID | Enter: save draft | Esc: cancel"
    or draftInfo and ("Type: " .. targetKind(draftInfo) ..
      "   Known: " .. yesNo(draftInfo.known) ..
      "   Current: " .. yesNo(draftInfo.current))
    or tostring(draftInfoError)
  writeCentered(8, detail, destinationEditing and colors.accent or colors.muted)

  drawAdjustmentButtons(10)

  local editWidth = 12
  local applyWidth = 12
  local syncWidth = 12
  local totalWidth = editWidth + applyWidth + syncWidth + 2
  local x = math.floor((width - totalWidth) / 2) + 1
  if destinationEditing then
    drawButton(x, 12, editWidth, "SAVE DRAFT", true,
      saveDestinationEdit, true)
  else
    drawButton(x, 12, editWidth, "EDIT ID", true,
      beginDestinationEdit)
  end
  drawButton(x + editWidth + 1, 12, applyWidth, "APPLY",
    destinationDirty and not destinationEditing, applyDestination)
  drawButton(x + editWidth + applyWidth + 2, 12, syncWidth, "SYNC",
    not destinationEditing, function() syncDestination(true) end)

  writeCentered(14,
    "Only discovered valid targets are accepted; failures do not consume fuel",
    colors.muted)
end

local function drawHeader()
  writeCentered(1, APP_NAME .. "  v" .. APP_VERSION, colors.accent)
  local state, stateColor = stateLabel()
  local summary = "Controller [" .. shortAddress(controller.address) ..
    "]  " .. state
  if snapshot and snapshotStale then
    summary = summary .. "  STALE"
    stateColor = colors.warning
  end
  writeCentered(2, summary, stateColor)
end

local function drawStatusBar()
  local now = computer.uptime()
  if warpArmedUntil > 0 then
    local remaining = math.max(0, math.ceil(warpArmedUntil - now))
    statusText = "Warp armed for " .. formatInteger(armedDestinationId) ..
      " - confirm within " .. remaining .. "s"
    statusColor = colors.warning
  elseif destinationEditing then
    statusText = "Editing target ID - Enter saves the local draft"
    statusColor = colors.accent
  elseif statusExpiresAt > 0 and now >= statusExpiresAt then
    statusText = "Ready"
    statusColor = colors.muted
    statusExpiresAt = 0
  end

  clearLine(height - 1, colors.panel)
  writeCentered(height - 1, statusText, statusColor, colors.panel)
  clearLine(height, colors.panel)
  local help = width >= 65
    and "[1-2] Tabs   [R] Rescan   [W] Warp   [C] Cancel   [Q] Quit"
    or "[1-2] Tabs  [R] Scan  [W] Warp  [Q] Quit"
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
  else
    drawDestination()
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

local function appendDestinationCharacter(character)
  if character < string.byte("0") or character > string.byte("9") then
    return false
  end
  local digit = string.char(character)
  if replaceEditOnType then
    destinationBuffer = digit
    replaceEditOnType = false
  elseif #destinationBuffer < 11 then
    destinationBuffer = destinationBuffer .. digit
  end
  return true
end

local function handleDestinationEditKey(character, code)
  if appendDestinationCharacter(character) then
    return true
  elseif character == string.byte("-") then
    if replaceEditOnType then
      destinationBuffer = "-"
    elseif string.sub(destinationBuffer, 1, 1) == "-" then
      destinationBuffer = string.sub(destinationBuffer, 2)
    else
      destinationBuffer = "-" .. destinationBuffer
    end
    replaceEditOnType = false
    return true
  elseif character == 8 or code == 14 then
    if replaceEditOnType then
      destinationBuffer = ""
      replaceEditOnType = false
    else
      destinationBuffer = string.sub(destinationBuffer, 1, -2)
    end
    return true
  elseif character == 13 or code == 28 then
    saveDestinationEdit()
    return true
  elseif character == 27 or code == 1 then
    cancelDestinationEdit(true)
    return true
  end
  return false
end

local function handleKey(character, code)
  if destinationEditing and handleDestinationEditKey(character, code) then
    return
  end

  if character >= string.byte("1") and character <= string.byte("2") then
    selectTab(character - string.byte("0"))
  elseif character == string.byte("r") or character == string.byte("R") then
    reconnect(true)
  elseif character == string.byte("w") or character == string.byte("W") then
    if selectedTab == 1 then
      activateWarp()
    end
  elseif character == string.byte("c") or character == string.byte("C")
      or character == 27 or code == 1 then
    cancelWarp(true)
  elseif character == 13 or code == 28 then
    if warpArmedUntil > 0 then
      confirmWarp()
    elseif selectedTab == 2 and destinationDirty then
      applyDestination()
    end
  elseif selectedTab == 2 and
      (character == string.byte("e") or character == string.byte("E")) then
    beginDestinationEdit()
  elseif selectedTab == 2 and
      (character == string.byte("a") or character == string.byte("A")) then
    applyDestination()
  elseif selectedTab == 2 and
      (character == string.byte("s") or character == string.byte("S")) then
    syncDestination(true)
  elseif character == string.byte("q") or character == string.byte("Q") then
    running = false
  end
end

local function handleWarpStarted(address, stationId, destinationId,
    remainingTicks)
  if address ~= controller.address then
    return
  end
  cancelWarp(false)
  warpInitialTicks = tonumber(remainingTicks) or 0
  setStatus("Warp started: station " .. formatInteger(stationId) ..
    " to target " .. formatInteger(destinationId) .. " - ETA " ..
    formatTicks(remainingTicks), colors.good, 8)
  refreshSnapshot(false)
end

local function handleWarpFinished(address, stationId, arrivedTargetId)
  if address ~= controller.address then
    return
  end
  cancelWarp(false)
  warpInitialTicks = 0
  setStatus("Warp complete: station " .. formatInteger(stationId) ..
    " arrived at target " .. formatInteger(arrivedTargetId),
    colors.good, 8)
  refreshSnapshot(false)
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
  if controller.proxy then
    setStatus("Warp Controller ready", colors.good)
  else
    setStatus("Warp Controller is not connected - press R after connecting",
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
    elseif name == "component_added" or name == "component_removed" then
      reconnect(false)
    elseif name == "warp_started" then
      handleWarpStarted(first, second, third, fourth)
    elseif name == "warp_finished" then
      handleWarpFinished(first, second, third)
    end

    if warpArmedUntil > 0 and computer.uptime() > warpArmedUntil then
      cancelWarp(false)
      setStatus("Warp confirmation expired", colors.warning)
    end

    if running then
      if controller.proxy then
        refreshSnapshot(false)
      else
        findController()
        if controller.proxy then
          refreshSnapshot(false)
        end
      end
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
