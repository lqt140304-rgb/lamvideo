@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo =====================================================================
echo    DỰNG DÀN NHÂN VẬT STICKMAN 3D (KIỂU B) - THE CRACK IN REALITY
echo =====================================================================
echo.
echo [1/3] Dang cap nhat code moi nhat tu GitHub...
git pull origin main

echo.
echo [2/3] Dang kiem tra duong dan Blender...
set BLENDER=D:\blender\blender.exe
if not exist "%BLENDER%" (
    if exist "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" (
        set "BLENDER=C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
    ) else if exist "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe" (
        set "BLENDER=C:\Program Files\Blender Foundation\Blender 4.2\blender.exe"
    ) else (
        where blender >nul 2>nul
        if %ERRORLEVEL% equ 0 (
            set BLENDER=blender
        ) else (
            echo [LOI] Khong tim thay Blender tai %BLENDER%!
            echo Vui long sua lai duong dan BLENDER trong file nay cho dung voi may cua ban.
            pause
            exit /b 1
        )
    )
)
echo Tim thay Blender tai: %BLENDER%

echo.
echo [3/3] Dang khoi chay Blender de dung 5 nhan vat, rig va xuat anh preview...
"%BLENDER%" -b --factory-startup --python "%~dp0dung_stickman_cast.py" -- --character all --save "%~dp0stickman_cast.blend" --render "%~dp0render-stickman" --samples 24

if %ERRORLEVEL% equ 0 (
    echo.
    echo =====================================================================
    echo [THANH CONG] Da tao xong file Blender 3D:
    echo   - File model 3D:  %~dp0stickman_cast.blend
    echo   - Thu muc anh:    %~dp0render-stickman\
    echo =====================================================================
) else (
    echo.
    echo [LOI] Co loi xay ra trong qua trinh dung Blender!
)

echo.
pause
