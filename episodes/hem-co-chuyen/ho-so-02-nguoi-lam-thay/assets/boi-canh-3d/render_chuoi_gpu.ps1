# Render chuỗi shot bằng GPU (RTX 3050) trên Windows — PowerShell.
#   .\render_chuoi_gpu.ps1 -Step 1 -Width 960 -Samples 32 -Out D:\render\chuoi
# Cần: Blender 5.0.x (blender.org) và ffmpeg trong PATH. Chạy trong thư mục này (assets\boi-canh-3d).
param(
  [string]$Blender = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe",
  [int]$Step = 1, [int]$Width = 960, [int]$Samples = 32, [string]$Out = "D:\render\chuoi",
  [string[]]$Shots = @('ESTABLISH_SAN','TOAN_CANH_DEM','HL_DOLLY','STEADI_RA_HL','TT_CUA_PUSH','A03_ARC','PAN_BEP_CUA','TT_BEP_PUSH','RACK_FOCUS_BAN','HANDHELD_A04','SAN_VAP','TT_GIUONG_PUSH','TOP_XOAY','ORBIT_GUONG','VERTIGO_GUONG','KINH_NUOC','KINH_NUOC_POV')
)
$env:BLENDER_DEVICE = "GPU"
$fps = [int](24 / $Step)
New-Item -ItemType Directory -Force -Path $Out | Out-Null
$log = Join-Path $Out "thoi-gian.log"; "" | Set-Content $log
$list = Join-Path $Out "ds.txt"; "" | Set-Content $list
foreach ($s in $Shots) {
  $t0 = Get-Date
  & $Blender -b -P camera_dong.py -- --shot $s --all --step $Step --out (Join-Path $Out $s) --samples $Samples --width $Width *> (Join-Path $Out "$s.log")
  $n = (Get-ChildItem (Join-Path $Out $s) -Filter *.png -ErrorAction SilentlyContinue).Count
  "{0}: {1} khung, {2:N0} s" -f $s, $n, ((Get-Date) - $t0).TotalSeconds | Add-Content $log
  if ($n -gt 0) {
    ffmpeg -y -loglevel error -framerate $fps -i (Join-Path $Out "$s\${s}_%03d.png") -c:v libx264 -pix_fmt yuv420p -crf 18 (Join-Path $Out "$s.mp4")
    "file '" + (Join-Path $Out "$s.mp4").Replace('\','/') + "'" | Add-Content $list
  }
}
ffmpeg -y -loglevel error -f concat -safe 0 -i $list -c copy (Join-Path $Out "chuoi-shot.mp4")
"XONG " + (Join-Path $Out "chuoi-shot.mp4") | Add-Content $log
