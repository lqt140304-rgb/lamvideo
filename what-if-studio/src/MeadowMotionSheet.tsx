import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {KitDefs} from './engine/kit';
import {SunsetRiceField,SunsetMeadowForeground} from './engine/sets/sunset_field';
import {MeadowFamily} from './episodes/tin-nhan-chua-gui/meadow_family';
import {ShC7_B,ShC8_A} from './episodes/tin-nhan-chua-gui/shots';

/** A set/pose check, not a synchronized dialogue or the finished film. */
export const MeadowMotionSheet:React.FC = () => {
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame*30/fps;
  return <AbsoluteFill><svg width="100%" height="100%" viewBox="0 0 1920 1080"><KitDefs />
    <SunsetRiceField t={t} seatedBank />
    <MeadowFamily t={t} demoTalk />
    <SunsetMeadowForeground t={t} shiftX={Math.sin(t*.008)*4} />
  </svg></AbsoluteFill>;
};

/** Uses the actual farewell shot, including the cheek wipe, hand clasp, close-up and soft transition. */
export const MotherFarewellSheet:React.FC = () => {
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  return <AbsoluteFill><svg width="100%" height="100%" viewBox="0 0 1920 1080"><KitDefs />
    {frame*30/fps<360?<ShC7_B t={frame*30/fps} len={360} f={3390+frame*30/fps} />:<ShC8_A t={frame*30/fps-360} len={210} f={3750+frame*30/fps-360} />}
  </svg></AbsoluteFill>;
};
