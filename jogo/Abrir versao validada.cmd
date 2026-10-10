@echo off
rem A mesa atual deve ser fechada antes. Abre o commit validado com backup consistente das partidas.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0abrir-versao-validada.ps1"
pause
