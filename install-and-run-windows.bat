@echo off
cd /d "%~dp0"
echo Installing Canvas Studio dependencies...
npm install
if errorlevel 1 (
  echo Installation failed. Check your internet connection and Node.js installation.
  pause
  exit /b 1
)
echo Starting Canvas Studio and its collaboration server...
npm run dev:all
pause
