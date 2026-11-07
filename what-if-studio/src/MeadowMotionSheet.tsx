import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Hero, LOOKS, sitPose, blinkAt } from './engine/rig';
import { KitDefs } from './engine/kit';
import { SunsetRiceField, SunsetMeadowForeground } from './engine/sets/sunset_field';
import { mouthCueAt } from './engine/mouth';

/** A set/rig motion check, not the finished episode or a synchronized dialogue scene. */
export const MeadowMotionSheet: React.FC = () => {
  const frame=useCurrentFrame(), {fps}=useVideoConfig(), t=frame*30/fps;
  const p=t%360;
  const family=[
    {x:810,s:0.68,look:LOOKS.thao,seed:3,f:1 as const,yaw:.28,head:-4},
    {x:960,s:0.95,look:LOOKS.meDuyThao,seed:9,f:-1 as const,yaw:-.2,head:3},
    {x:1124,s:0.84,look:LOOKS.duy,seed:1,f:-1 as const,yaw:-.3,head:4},
  ];
  return <AbsoluteFill><svg width="100%" height="100%" viewBox="0 0 1920 1080"><KitDefs />
    <SunsetRiceField t={t} />
    {family.map((a,i)=><Hero key={i} look={a.look} rimId="rimStreetlamp" pose={{
      ...sitPose(a.x,802,a.s,a.f,{t,seed:a.seed,yaw:a.yaw,expr:'smile',look:a.f*.3,headTilt:a.head}),
      blink:blinkAt(t,a.seed), ...mouthCueAt(p,i===1?[{from:55,to:72,shape:'a',open:.3},{from:78,to:92,shape:'e',open:.25},{from:105,to:121,shape:'o',open:.25}]:[]),
    }} />)}
    <SunsetMeadowForeground t={t} shiftX={Math.sin(t*.008)*4} />
  </svg></AbsoluteFill>;
};
