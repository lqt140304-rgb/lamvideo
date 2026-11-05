@echo off
chcp 65001 >nul
REM Cai What If studio (ban mien phi, tieng Viet) - chay 1 lan. Can: Node 18+, Python 3.9+, ffmpeg.
cd /d "%~dp0..\what-if-studio"
where node >nul 2>nul || (echo [!] Chua co Node.js: cai tu https://nodejs.org roi chay lai & pause & exit /b 1)
where ffmpeg >nul 2>nul || (echo [!] Chua co ffmpeg, dang cai bang winget... & winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements)
REM Tim Python that (lenh "python" tren Windows co the chi la loi tat mo Microsoft Store)
set PY=
if defined VIENEU_PYTHON set PY="%VIENEU_PYTHON%"
if not defined PY (py -3 -c "import sys" >nul 2>nul && set PY=py -3)
if not defined PY (python -c "import sys" >nul 2>nul && set PY=python)
if not defined PY (
  echo [!] Khong tim thay Python. Cai Python 3.11 tu https://www.python.org/downloads/ ^(tick "Add python.exe to PATH"^),
  echo     hoac neu VieNeu-TTS dang chay bang uv: set VIENEU_PYTHON=C:\duong-dan\VieNeu-TTS\.venv\Scripts\python.exe
  pause & exit /b 1
)
echo Dung Python: %PY%
call npm install --no-audit --no-fund
call npm rebuild esbuild >nul 2>nul
if not exist node_modules\remotion (echo [!] npm install loi & pause & exit /b 1)
%PY% -m pip install numpy Pillow faster-whisper edge-tts || (echo [!] pip install loi & pause & exit /b 1)
%PY% -c "import vieneu" 2>nul || %PY% -m pip install vieneu
echo.
echo Giong VieNeu co san:
%PY% "%~dp0..\.claude\skills\what-if-animation\scripts\voice.py" --voices
echo.
echo Thu render 1 khung hinh tap mau Rewind...
call npx.cmd remotion still src/index.ts Rewind out/rewind-test.png --frame=60 && echo [OK] Studio chay duoc: what-if-studio\out\rewind-test.png
pause
