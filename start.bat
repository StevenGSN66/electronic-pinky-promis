@echo off
chcp 65001 >nul 2>&1
title 信任星球 - 电子拉钩
echo.
echo  ========================================
echo    信任星球 - 电子拉钩 Demo
echo  ========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] 未检测到 Node.js
    echo.
    echo 方案一：直接打开 HTML（无需安装）
    echo   双击 open-demo.html 即可在浏览器中体验
    echo.
    echo 方案二：安装 Node.js 后使用 AI 功能
    echo   下载地址: https://nodejs.org
    echo.
    pause
    exit /b
)

:: 启动服务器
echo [OK] Node.js 已检测到
echo [OK] 正在启动服务器...
echo.
echo ----------------------------------------
echo  打开浏览器访问: http://localhost:3000
echo  按 Ctrl+C 可停止服务器
echo ----------------------------------------
echo.

:: 延迟打开浏览器
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: 启动
node server.js
pause