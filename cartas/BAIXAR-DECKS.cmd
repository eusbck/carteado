@echo off
setlocal
cd /d "%~dp0"
echo Biblioteca de decks de Magic - perfil nvvvm
echo As listas e imagens serao baixadas para esta pasta.
echo.
where py >nul 2>nul
if not errorlevel 1 goto use_py
where python >nul 2>nul
if not errorlevel 1 goto use_python
echo Python 3.10 ou posterior nao foi encontrado.
pause
exit /b 1
:use_py
py -3 -X utf8 -u "%~dp0coletar.py" %*
set "DECK_ARCHIVE_EXIT=%ERRORLEVEL%"
goto done
:use_python
python -X utf8 -u "%~dp0coletar.py" %*
set "DECK_ARCHIVE_EXIT=%ERRORLEVEL%"
:done
echo.
if "%DECK_ARCHIVE_EXIT%"=="0" echo Coleta concluida. Abra catalogo.html para consultar os decks.
if "%DECK_ARCHIVE_EXIT%"=="2" echo Coleta parcial. Consulte manifest.json para ver as pendencias.
if "%DECK_ARCHIVE_EXIT%"=="3" echo Plano preparado. Execute sem --plan para baixar os arquivos restantes.
if "%DECK_ARCHIVE_EXIT%"=="1" echo A coleta foi interrompida. O motivo aparece acima e em manifest.json.
echo Arquivos concluidos sao reaproveitados ao executar novamente.
pause
exit /b %DECK_ARCHIVE_EXIT%
