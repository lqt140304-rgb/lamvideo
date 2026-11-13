#!/usr/bin/env bash
# Ghép nối phòng thật (KINH_NUOC) → thế giới gương (XUYEN) bằng chuyển cảnh "sóng nước lan" (xfade custom; lưu ý P chạy 1→0 nên dùng 1−P; ffmpeg phải chạy -filter_threads 1 vì st()/ld() dùng chung giữa các luồng):
#   vòng sóng nở ra từ tâm mặt gương trên màn hình (CX, CY là tỉ lệ khung), hai bên mép sóng méo theo hướng bán kính (ảnh phòng thật bị gợn trước mép, phòng đảo hiện sau mép),
#   mép sáng lân tinh (Deep Teal) và vài vòng sóng tàn dư phía sau. Dùng:  ./ghep_xuyen_guong.sh a.mp4 b.mp4 ra.mp4 [giây_chồng=0.9] [fps=12]
A=${1:?a.mp4}; B=${2:?b.mp4}; OUT=${3:?out.mp4}; DUR=${4:-0.9}; FPS=${5:-12}
CX=${CX:-0.56}; CY=${CY:-0.5}
LEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A"); OFF=$(python3 -c "print(round($LEN-$DUR,3))")
EXPR="st(7,(1-P)*(1-P)*(3-2*(1-P)));st(0,${CX}*W);st(1,${CY}*H);st(2,hypot(X-ld(0),Y-ld(1)));st(3,ld(7)*0.62*hypot(W,H));st(4,ld(2)-ld(3));\
st(5,exp(-pow(ld(4)/(0.09*H),2))+0.6*exp(-pow((ld(4)+0.15*H)/(0.12*H),2)));st(6,9*ld(5)*sin(ld(2)*0.2-ld(7)*30));\
st(8,X+ld(6)*(X-ld(0))/max(ld(2),1));st(9,Y+ld(6)*(Y-ld(1))/max(ld(2),1));\
st(0,if(lt(ld(4),0),if(eq(PLANE,0),b0(ld(8),ld(9)),if(eq(PLANE,1),b1(ld(8),ld(9)),b2(ld(8),ld(9)))),if(eq(PLANE,0),a0(ld(8),ld(9)),if(eq(PLANE,1),a1(ld(8),ld(9)),a2(ld(8),ld(9))))));\
st(1,exp(-pow(ld(4)/(0.022*H),2))*(1-ld(7)*0.4));\
clip(ld(0)+ld(1)*if(eq(PLANE,0),140,if(eq(PLANE,1),150,50)),0,255)"
ffmpeg -y -loglevel error -filter_threads 1 -filter_complex_threads 1 -i "$A" -i "$B" -filter_complex "[0:v]format=gbrp,fps=$FPS[a];[1:v]format=gbrp,fps=$FPS[b];[a][b]xfade=transition=custom:duration=$DUR:offset=$OFF:expr='$EXPR',format=yuv420p" -c:v libx264 -crf 18 "$OUT"
