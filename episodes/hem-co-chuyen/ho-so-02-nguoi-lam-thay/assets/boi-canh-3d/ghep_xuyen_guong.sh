#!/usr/bin/env bash
# Ghép nối phòng thật (KINH_NUOC) → thế giới gương (XUYEN) bằng chuyển cảnh KINH DỊ HUYỀN BÍ (xfade custom):
#   1) trước khi sóng nổi lên, phòng thật bị "hút" dần: mất màu, tối, vignette siết lại (căng thẳng)
#   2) từ tâm mặt gương, màn sương đen loang ra như mực (mép gồ ghề bằng sóng theo góc, không phải vòng tròn đều), phía trước mép tối sầm lại
#   3) mép loang có quầng xanh nhạt lạnh + gợn sóng méo mạnh theo hướng bán kính, vài vòng gợn tàn dư phía sau
#   4) phòng đảo hiện ra sau mép; toàn bộ phủ hạt phim, vignette, lệch màu nhẹ, nhịp "tim đập" sáng tối
# Dùng:  ./ghep_xuyen_guong.sh a.mp4 b.mp4 ra.mp4 [giây_chồng=1.6] [fps=12]
# (P của xfade chạy 1→0 nên dùng 1−P; bắt buộc -filter_threads 1 vì st()/ld() dùng chung giữa các luồng, nếu không ra nhiễu)
A=${1:?a.mp4}; B=${2:?b.mp4}; OUT=${3:?out.mp4}; DUR=${4:-1.6}; FPS=${5:-12}
CX=${CX:-0.56}; CY=${CY:-0.5}
LEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A"); OFF=$(python3 -c "print(round($LEN-$DUR,3))")
TH="atan2(Y-ld(1),X-ld(0))"
EXPR="st(7,(1-P)*(1-P)*(3-2*(1-P)));st(0,${CX}*W);st(1,${CY}*H);st(2,hypot(X-ld(0),Y-ld(1)));\
st(3,ld(7)*0.7*hypot(W,H)*(1+0.12*sin(5*${TH}+ld(7)*5)+0.07*sin(11*${TH}-ld(7)*8)));st(4,ld(2)-ld(3));\
st(5,exp(-pow(ld(4)/(0.1*H),2))+0.7*exp(-pow((ld(4)+0.16*H)/(0.13*H),2)));st(6,13*ld(5)*sin(ld(2)*0.17-ld(7)*34));\
st(8,clip(X+ld(6)*(X-ld(0))/max(ld(2),1),0,W-1));st(9,clip(Y+ld(6)*(Y-ld(1))/max(ld(2),1),0,H-1));\
st(0,if(lt(ld(4),0),if(eq(PLANE,0),b0(ld(8),ld(9)),if(eq(PLANE,1),b1(ld(8),ld(9)),b2(ld(8),ld(9)))),if(eq(PLANE,0),a0(ld(8),ld(9)),if(eq(PLANE,1),a1(ld(8),ld(9)),a2(ld(8),ld(9))))));\
st(1,exp(-pow((ld(4)-0.05*H)/(0.17*H),2))*gt(ld(4),0));st(5,exp(-pow(ld(4)/(0.016*H),2))*(1-ld(7)*0.55));\
clip(ld(0)*(1-0.9*ld(1))+ld(5)*if(eq(PLANE,0),95,if(eq(PLANE,1),115,60)),0,255)"
# giai đoạn căng thẳng: phòng thật mất màu/tối dần trong 1,3 s trước khi sóng nổi lên + vignette siết
PRE="eq=eval=frame:saturation='1-0.55*clip((t-(${OFF}-1.3))/1.3,0,1)':contrast='1+0.12*clip((t-(${OFF}-1.3))/1.3,0,1)':brightness='-0.07*clip((t-(${OFF}-1.3))/1.3,0,1)',vignette=eval=frame:angle='0.2+0.55*clip((t-(${OFF}-1.3))/1.3,0,1)'"
POST="eq=contrast=1.08:saturation=0.9:gamma_b=1.04:brightness='0.015*pow(max(0,sin(6.2832*1.15*t)),10)',rgbashift=rh=-2:bh=2,noise=alls=7:allf=t,vignette=angle=0.45"
ffmpeg -y -loglevel error -filter_threads 1 -filter_complex_threads 1 -i "$A" -i "$B" -filter_complex "[0:v]format=gbrp,fps=$FPS,${PRE},format=gbrp[a];[1:v]format=gbrp,fps=$FPS[b];[a][b]xfade=transition=custom:duration=$DUR:offset=$OFF:expr='$EXPR',format=yuv420p,${POST}" -c:v libx264 -crf 16 -pix_fmt yuv420p "$OUT"
