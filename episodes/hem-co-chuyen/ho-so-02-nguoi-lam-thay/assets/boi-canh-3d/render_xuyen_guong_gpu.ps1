# Render GPU (RTX 3050) đoạn nối phòng thật → thế giới gương: KINH_NUOC (phòng thật) + XUYEN (phòng đảo) rồi ghép bằng sóng nước lan.
#   Thử nhanh đo thời gian (3 khung mỗi đoạn):  .\render_xuyen_guong_gpu.ps1 -Test
#   Bản cuối 24 fps, 1280 px, 64 mẫu:           .\render_xuyen_guong_gpu.ps1 -Out D:\render\xuyen
#   Nhẹ hơn (12 fps thật rồi nội suy lên 24):   .\render_xuyen_guong_gpu.ps1 -Step 2 -Width 960 -Samples 48
# Cần Blender 5.0.x + ffmpeg trong PATH; chạy trong thư mục assets\boi-canh-3d.
param(
  [string]$Blender = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe",
  [int]$Step = 1, [int]$Width = 1280, [int]$Samples = 64, [string]$Out = "D:\render\xuyen", [double]$Song = 1.0, [switch]$Test
)
$env:BLENDER_DEVICE = "GPU"
New-Item -ItemType Directory -Force -Path $Out | Out-Null
$log = Join-Path $Out "thoi-gian.log"; "" | Set-Content $log
$frames = if ($Test) { @(1, 36, 72) } else { 1..72 | Where-Object { (($_ - 1) % $Step) -eq 0 } }
$fl = $frames -join ','
$fps = [int](24 / $Step)

# --- 1) phòng thật: shot KINH_NUOC (camera_dong.py nhận --frames)
$t0 = Get-Date
& $Blender -b -P camera_dong.py -- --shot KINH_NUOC --frames $fl --out (Join-Path $Out "a") --samples $Samples --width $Width *> (Join-Path $Out "a.log")
"KINH_NUOC: {0} khung, {1:N0} s" -f $frames.Count, ((Get-Date) - $t0).TotalSeconds | Add-Content $log
# --- 2) phòng đảo: shot XUYEN
$t0 = Get-Date
New-Item -ItemType Directory -Force -Path (Join-Path $Out "b") | Out-Null
& $Blender -b -P the_gioi_guong.py -- --cam XUYEN --frames $fl --out (Join-Path $Out "b\XUYEN.png") --samples $Samples --width $Width *> (Join-Path $Out "b.log")
"XUYEN: {0} khung, {1:N0} s" -f $frames.Count, ((Get-Date) - $t0).TotalSeconds | Add-Content $log
Select-String -Path (Join-Path $Out "a.log"), (Join-Path $Out "b.log") -Pattern "render\]" | ForEach-Object { $_.Line } | Add-Content $log   # dòng xác nhận GPU/CPU
if ($Test) { "XONG BẢN THỬ: xem $Out\a và $Out\b, thời gian ở $log (nhân với 72/3 cho cả đoạn)" | Add-Content $log; Get-Content $log; return }

# --- 3) ghép: mỗi đoạn thành mp4 rồi xfade custom "sóng nước lan" (st()/ld() dùng chung giữa luồng → bắt buộc -filter_threads 1)
ffmpeg -y -loglevel error -framerate $fps -pattern_type glob -i (Join-Path $Out "a\KINH_NUOC_*.png") -c:v libx264 -pix_fmt yuv420p -crf 14 (Join-Path $Out "a.mp4")
ffmpeg -y -loglevel error -framerate $fps -pattern_type glob -i (Join-Path $Out "b\XUYEN_*.png") -c:v libx264 -pix_fmt yuv420p -crf 14 (Join-Path $Out "b.mp4")
$len = [double](ffprobe -v error -show_entries format=duration -of csv=p=0 (Join-Path $Out "a.mp4"))
$off = [math]::Round($len - $Song, 3)
$expr = "st(7,(1-P)*(1-P)*(3-2*(1-P)));st(0,0.56*W);st(1,0.5*H);st(2,hypot(X-ld(0),Y-ld(1)));st(3,ld(7)*0.62*hypot(W,H));st(4,ld(2)-ld(3));" +
 "st(5,exp(-pow(ld(4)/(0.09*H),2))+0.6*exp(-pow((ld(4)+0.15*H)/(0.12*H),2)));st(6,9*ld(5)*sin(ld(2)*0.2-ld(7)*30));" +
 "st(8,X+ld(6)*(X-ld(0))/max(ld(2),1));st(9,Y+ld(6)*(Y-ld(1))/max(ld(2),1));" +
 "st(0,if(lt(ld(4),0),if(eq(PLANE,0),b0(ld(8),ld(9)),if(eq(PLANE,1),b1(ld(8),ld(9)),b2(ld(8),ld(9)))),if(eq(PLANE,0),a0(ld(8),ld(9)),if(eq(PLANE,1),a1(ld(8),ld(9)),a2(ld(8),ld(9))))));" +
 "st(1,exp(-pow(ld(4)/(0.022*H),2))*(1-ld(7)*0.4));clip(ld(0)+ld(1)*if(eq(PLANE,0),140,if(eq(PLANE,1),150,50)),0,255)"
$fc = "[0:v]format=gbrp,fps=$fps[a];[1:v]format=gbrp,fps=$fps[b];[a][b]xfade=transition=custom:duration=$Song`:offset=$off`:expr='$expr',format=yuv420p"
ffmpeg -y -loglevel error -filter_threads 1 -filter_complex_threads 1 -i (Join-Path $Out "a.mp4") -i (Join-Path $Out "b.mp4") -filter_complex $fc -c:v libx264 -crf 14 (Join-Path $Out "xuyen-guong-noi-the-gioi.mp4")
"XONG " + (Join-Path $Out "xuyen-guong-noi-the-gioi.mp4") | Add-Content $log
