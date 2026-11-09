@echo off
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js 20 or newer and try again.
  pause
  exit /b 1
)
for /f %%A in ('node -p "process.platform + '-' + process.arch"') do set "PLATFORM=%%A"
if not exist "node_modules\.eduagent-%PLATFORM%-ready" (
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
  type nul > "node_modules\.eduagent-%PLATFORM%-ready"
)
call npm run dev
pause
