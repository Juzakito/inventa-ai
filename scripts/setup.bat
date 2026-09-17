@echo off
REM setup.bat — Wrapper Windows: ejecuta setup.ps1
powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
