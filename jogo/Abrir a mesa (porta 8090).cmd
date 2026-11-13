@echo off
rem Abre a mesa na porta 8090 (a 8080 pode estar ocupada pela Steam). Deixe a janela aberta durante a partida.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0abrir-mesa.ps1" -Porta 8090
pause
