@echo off
setlocal

set "PROJECT_ROOT=C:\Users\MRX-APS\Desktop\WEBSITE FOR VIODE"

cd /d "%PROJECT_ROOT%"

if not exist "%PROJECT_ROOT%\server\package.json" (
  echo Server project not found at:
  echo %PROJECT_ROOT%\server\package.json
  pause
  exit /b 1
)

if not exist "%PROJECT_ROOT%\client\package.json" (
  echo Client project not found at:
  echo %PROJECT_ROOT%\client\package.json
  pause
  exit /b 1
)

echo Stopping old Viode ports if they are already running...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 5000,5173 } | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>nul

echo Starting Viode server...
start "Viode Server" cmd /k cd /d "%PROJECT_ROOT%\server" ^&^& npm.cmd run dev

timeout /t 2 /nobreak >nul

echo Starting Viode client...
start "Viode Client" cmd /k cd /d "%PROJECT_ROOT%\client" ^&^& npm.cmd run dev -- --host 127.0.0.1

timeout /t 4 /nobreak >nul

echo Opening website...
start "" "http://127.0.0.1:5173"

echo.
echo Viode is starting in two windows:
echo - Viode Server
echo - Viode Client
echo.
echo If a window shows an error, keep it open and check that message.
pause
