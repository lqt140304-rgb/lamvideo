@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Dang cap nhat code moi nhat tu GitHub ===
git pull origin main

echo.
echo === Dang dung va kiem tra 10 bo quan ao tren NHAN-VAT-GOC-001 ===
set BLENDER=D:\blender\blender.exe
if not exist "%BLENDER%" (
    echo [LOI] Khong tim thay Blender tai %BLENDER%
    echo Vui long sua duong dan BLENDER trong file nay cho dung voi may cua ban.
    pause
    exit /b 1
)

"%BLENDER%" -b --factory-startup --python "%~dp0thu_quan_ao_goc.py" -- --outfit all --check --render "%~dp0render-quan-ao" --samples 24

echo.
echo === HOAN TAT! Anh xem truoc nam trong thu muc: %~dp0render-quan-ao ===
pause
