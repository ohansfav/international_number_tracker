@echo off
echo ========================================
echo International Number Tracker - Professional Edition
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    echo Please install npm (comes with Node.js)
    pause
    exit /b 1
)

echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo Installing Node.js dependencies...
cd electron
npm install
if errorlevel 1 (
    echo Error: Failed to install Node.js dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo To run the application:
echo 1. Make sure you are in the international_number_tracker directory
echo 2. Run: cd electron
echo 3. Run: npm start
echo.
echo Or simply run this batch file again to start the app.
echo.

pause

REM Check if we should start the app
set /p start_app="Do you want to start the application now? (y/n): "
if /i "%start_app%"=="y" goto start_app
if /i "%start_app%"=="yes" goto start_app
exit /b 0

:start_app
echo.
echo Starting International Number Tracker...
cd electron
npm start
