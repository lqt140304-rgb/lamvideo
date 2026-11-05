@echo off
chcp 65001 >nul
REM Chay 1 buoc cua What If: tools\what-if.bat voice <slug>   (voice / plan / board / sfx / mixcheck / motiongrid / master)
REM stills: tools\what-if.bat stills <slug> [S3 S7]
cd /d "%~dp0..\what-if-studio"
set "SK=%~dp0..\.claude\skills\what-if-animation\scripts"
REM Tim Python that (lenh "python" tren Windows co the chi la loi tat mo Microsoft Store)
set PY=
if defined VIENEU_PYTHON set PY="%VIENEU_PYTHON%"
REM Python ma "npm run voice" da tim thay va luu lai (co san VieNeu)
if not defined PY if exist "%~dp0..\.vieneu-python" (set /p VP=<"%~dp0..\.vieneu-python")
if not defined PY if defined VP set PY="%VP%"
if not defined PY (py -3 -c "import sys" >nul 2>nul && set PY=py -3)
if not defined PY (python -c "import sys" >nul 2>nul && set PY=python)
if not defined PY (
  echo [!] Khong tim thay Python. Cai Python 3.11 tu https://www.python.org/downloads/ ^(tick "Add python.exe to PATH"^),
  echo     hoac neu VieNeu-TTS dang chay bang uv: set VIENEU_PYTHON=C:\duong-dan\VieNeu-TTS\.venv\Scripts\python.exe
  pause & exit /b 1
)

if "%1"=="stills" (node "%SK%\stills.mjs" %2 %3 %4 %5 %6 %7 %8 %9) else (%PY% "%SK%\%1.py" %2 %3 %4 %5 %6 %7 %8 %9)
