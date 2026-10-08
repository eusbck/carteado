@echo off
rem Abre a mesa do Commander para o grupo (servidor + tunel). Deixe a janela aberta durante a partida.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0abrir-mesa.ps1"
pause
