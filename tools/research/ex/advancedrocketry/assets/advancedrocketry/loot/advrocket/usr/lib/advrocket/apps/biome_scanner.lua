-- AdvancedRocketry Continuation Biome Scanner GUI for OpenOS.
-- Minecraft 1.7.10 / OpenComputers 1.12.44-GTNH.

local component = require("component")
local computer = require("computer")
local event = require("event")

local APP_NAME = "Advanced Rocketry Biome Scanner"
local APP_VERSION = "1.0.0"
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

local scanner = {
  componentName = "biome_scanner",
  label = "Biome Scanner"
}

local biomes = {}
local page = 1
local pageSize = 1
local buttons = {}
local scanError = nil
local statusText = "Starting..."
local statusColor = colors.muted
local statusExpiresAt = 0
local lastTargetId = nil
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

local function shortAddress(address)
  if type(address) ~= "string" then
    return "--------"
  end
  return string.sub(address, 1, 8)
end

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

local function pageCount()
  return math.max(1, math.ceil(#biomes / pageSize))
end

local function setPage(value)
  page = clamp(value, 1, pageCount())
end

local function findScanner()
  local ok, addressOrError = pcall(function()
    local iterator = component.list(scanner.componentName, true)
    return iterator()
  end)

  if not ok or not addressOrError then
    scanner.address = nil
    scanner.proxy = nil
    scanner.error = ok and "not connected" or tostring(addressOrError)
    scanner.status = nil
    return false
  end

  local proxyOk, proxyOrError = pcall(component.proxy, addressOrError)
  if not proxyOk then
    scanner.address = nil
    scanner.proxy = nil
    scanner.error = tostring(proxyOrError)
    scanner.status = nil
    return false
  end

  scanner.address = addressOrError
  scanner.proxy = proxyOrError
  scanner.error = nil
  return true
end

local function invokeGetter(method, ...)
  if not scanner.proxy or not scanner.address then
    return false, "not_connected", "Biome Scanner is not connected"
  end

  local invoked, first, second, third = pcall(
    component.invoke,
    scanner.address,
    method,
    ...
  )
  if not invoked then
    return false, "oc_exception", tostring(first)
  end
  if first == nil then
    return false, tostring(second or "unknown_error"),
      tostring(third or "Biome Scanner call failed")
  end
  return true, first, second, third
end

local function normalizeBiomes(raw)
  local result = {}
  if type(raw) ~= "table" then
    return result
  end

  for _, entry in pairs(raw) do
    if type(entry) == "table" then
      result[#result + 1] = {
        id = tonumber(entry.id) or -1,
        name = cleanText(entry.name ~= nil and entry.name or "Unnamed biome"),
        modId = cleanText(entry.modId ~= nil and entry.modId or "unknown")
      }
    end
  end

  table.sort(result, function(first, second)
    if first.id ~= second.id then
      return first.id < second.id
    end
    if first.name ~= second.name then
      return first.name < second.name
    end
    return first.modId < second.modId
  end)
  return result
end

local function performScan(showSuccess)
  local ok, valueOrCode, message = invokeGetter("scan")
  if not ok then
    biomes = {}
    page = 1
    scanError = tostring(valueOrCode) .. ": " .. tostring(message)
    setStatus("Scan failed - " .. scanError, colors.bad, 8)
    return false
  end

  biomes = normalizeBiomes(valueOrCode)
  page = 1
  scanError = nil
  if showSuccess then
    setStatus("Scan complete: " .. #biomes .. " biomes detected", colors.good)
  end
  return true
end

local function refreshScannerStatus()
  if not scanner.proxy then
    scanner.status = nil
    return false
  end

  local ok, valueOrCode, message = invokeGetter("getStatus")
  if not ok then
    scanner.status = nil
    scanner.error = tostring(valueOrCode) .. ": " .. tostring(message)
    return false
  end

  scanner.status = valueOrCode
  scanner.error = nil
  local targetId = valueOrCode.currentTargetId
  local changed = lastTargetId ~= nil and targetId ~= lastTargetId
  lastTargetId = targetId
  return changed
end

local function reconnectAndScan(showMessage)
  local found = findScanner()
  if not found then
    biomes = {}
    scanError = nil
    setStatus("Component scan complete: Biome Scanner not connected",
      colors.warning, 8)
    return
  end

  refreshScannerStatus()
  local scanned = performScan(showMessage)
  if showMessage and not scanned then
    return
  end
  if showMessage then
    setStatus("Connected and scanned " .. #biomes .. " biomes", colors.good)
  end
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

local function drawBiomeRow(y, ordinal, biome)
  local background = ordinal % 2 == 0 and colors.panel or colors.background
  clearLine(y, background)

  local id = tostring(biome.id)
  local prefix = string.format("%3d  %5s  ", ordinal, id)
  writeAt(1, y, prefix, colors.muted, background)

  local x = #prefix + 1
  local available = math.max(0, width - x + 1)
  local suffix = " [" .. biome.modId .. "]"
  if #suffix > available then
    writeAt(x, y, suffix, colors.accent, background, available)
    return
  end

  local nameLimit = available - #suffix
  local name = biome.name
  if #name > nameLimit then
    if nameLimit >= 4 then
      name = string.sub(name, 1, nameLimit - 3) .. "..."
    else
      name = string.sub(name, 1, nameLimit)
    end
  end
  writeAt(x, y, name, colors.text, background)
  writeAt(x + #name, y, suffix, colors.accent, background)
end

local function drawScannerSummary()
  if not scanner.proxy then
    writeCentered(2, "Biome Scanner: OFFLINE", colors.bad)
    return
  end

  local state = scanner.status and scanner.status.state or "unknown"
  local stateColor = state == "ready" and colors.good or colors.warning
  writeCentered(2,
    "Biome Scanner [" .. shortAddress(scanner.address) .. "]  State: " ..
      tostring(state),
    stateColor)
end

local function drawTable()
  clearLine(3, colors.panel)

  if not scanner.proxy then
    writeCentered(7, "Biome Scanner not connected", colors.bad)
    writeCentered(8, "Connect it directly to the OC cable, then press R",
      colors.muted)
    return
  end
  if scanner.error then
    writeCentered(7, "Biome Scanner error", colors.bad)
    writeCentered(8, scanner.error, colors.warning)
    return
  end
  if scanError then
    writeCentered(7, "Scan unavailable", colors.bad)
    writeCentered(8, scanError, colors.warning)
    return
  end

  local targetId = scanner.status and scanner.status.currentTargetId or "--"
  writeCentered(4,
    "Current orbit target: " .. tostring(targetId) ..
      "   Detected biomes: " .. #biomes,
    colors.text)
  clearLine(5, colors.panel)
  writeAt(1, 5, "  #     ID  BIOME NAME", colors.muted, colors.panel)
  writeAt(math.max(1, width - 11), 5, "[MOD ID]", colors.accent,
    colors.panel)

  local firstIndex = (page - 1) * pageSize + 1
  local lastIndex = math.min(#biomes, firstIndex + pageSize - 1)
  for index = firstIndex, lastIndex do
    drawBiomeRow(6 + index - firstIndex, index, biomes[index])
  end

  if #biomes == 0 then
    writeCentered(7, "No biomes were returned by the scanner", colors.warning)
  end
end

local function drawPagination()
  local totalPages = pageCount()
  writeCentered(height - 4,
    "Page " .. page .. " / " .. totalPages .. "   (" .. #biomes ..
      " biomes, " .. pageSize .. " per page)",
    colors.muted)

  addButtonRow(height - 3, {
    {
      label = "|< FIRST",
      enabled = page > 1,
      handler = function() setPage(1) end
    },
    {
      label = "< PREV",
      enabled = page > 1,
      handler = function() setPage(page - 1) end
    },
    {
      label = "SCAN",
      enabled = scanner.proxy ~= nil,
      handler = function() performScan(true) end
    },
    {
      label = "NEXT >",
      enabled = page < totalPages,
      handler = function() setPage(page + 1) end
    },
    {
      label = "LAST >|",
      enabled = page < totalPages,
      handler = function() setPage(totalPages) end
    }
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
  writeCentered(height,
    "[A/D] Page   [S] Scan   [R] Reconnect   [Q] Quit",
    colors.muted, colors.panel)
end

local function render()
  buttons = {}
  setColors(colors.text, colors.background)
  gpu.fill(1, 1, width, height, " ")

  writeCentered(1, APP_NAME .. "  v" .. APP_VERSION, colors.accent)
  drawScannerSummary()
  drawTable()
  drawPagination()
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
  if character == string.byte("a") or character == string.byte("A")
      or character == string.byte("[") or code == 203 then
    setPage(page - 1)
  elseif character == string.byte("d") or character == string.byte("D")
      or character == string.byte("]") or code == 205 then
    setPage(page + 1)
  elseif code == 199 then
    setPage(1)
  elseif code == 207 then
    setPage(pageCount())
  elseif character == string.byte("s") or character == string.byte("S") then
    performScan(true)
  elseif character == string.byte("r") or character == string.byte("R") then
    reconnectAndScan(true)
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
  findScanner()
  refreshScannerStatus()
  if scanner.proxy then
    performScan(true)
  else
    setStatus("Biome Scanner is not connected - press R after connecting",
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
      reconnectAndScan(false)
    end

    if running then
      local targetChanged = refreshScannerStatus()
      if targetChanged then
        performScan(true)
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
