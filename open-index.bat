@echo off
start bun run start
timeout /t 3 >nul
start http://localhost:3000