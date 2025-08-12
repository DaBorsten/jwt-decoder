@echo off
start /min bun run start
timeout /t 3 >nul
start http://localhost:3000