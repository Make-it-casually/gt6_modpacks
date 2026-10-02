@echo off
rem gt6bridge installer - double click after running build.ps1
rem NEVER run this while Minecraft is open: replacing a jar that the running game has already
rem loaded makes FML fail with ClassNotFoundException and breaks that session's state engine.
setlocal
set JAR=%~dp0gt6bridge.jar
set DEST=E:\game\minecraft\gt6\.minecraft\versions\GT6\mods\gt6bridge.jar
set CHECK=%~dp0..\tools\game-check.ps1

if not exist "%JAR%" (
    echo [ERROR] %JAR% not found - run build.ps1 first.
    pause
    exit /b 1
)

if exist "%CHECK%" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%CHECK%" >nul 2>&1
    if not errorlevel 1 (
        echo [STOP] Minecraft looks like it is still running. Close the game completely first.
        pause
        exit /b 1
    )
)

copy /Y "%JAR%" "%DEST%" >nul
if errorlevel 1 (
    echo [ERROR] could not copy to %DEST%
    pause
    exit /b 1
)
echo Installed:
echo   %DEST%
echo.
echo Start the game once: the mod writes config\gt6bridge\*.csv, report.txt, report-preinit.txt
echo and materials-known.txt at load complete.
pause
