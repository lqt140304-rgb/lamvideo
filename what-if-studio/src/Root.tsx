import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { MeadowMotionSheet, MotherFarewellSheet } from './MeadowMotionSheet';
import { VfxSheet, VFX_SAMPLES, RigMotionSheet } from './VfxSheet';
import {
  CastSheet,
  NewCastSheet,
  FurnitureSheet,
  VehicleSheet,
  OngLocShopSheet,
  MotherHouseSheet,
  OpeningC0Sheet,
  MeadowAndDealsSheet,
} from './CastSheet';
import { ColorScriptSheet } from './ColorScriptSheet';
import { TinNhanChuaGuiAnimatic } from './episodes/tin-nhan-chua-gui/animatic';
import tinNhanTimeline from './episodes/tin-nhan-chua-gui/timeline.json';
import { ThuC1, ThuC1Tinh, THU_C1_TOTAL } from './episodes/tin-nhan-chua-gui/thu-c1';

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast, NewCast, FurnitureSheet, VehicleSheet, OngLocShopSheet, MotherHouseSheet, OpeningC0Sheet, MeadowAndDealsSheet, and ColorScriptSheet render the studio asset sheets.
//   npx remotion studio src/index.ts --port 3430

export const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      {EPISODES.map((e) => (
        <React.Fragment key={e.id}>
          <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} {...common} />
          <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} {...common} />
        </React.Fragment>
      ))}
      <Composition id="VfxLab" component={VfxSheet} durationInFrames={360} {...common} />
      {VFX_SAMPLES.map(sample => <Composition key={sample.id} id={`VFX-${sample.id}`} component={VfxSheet} defaultProps={{ effect: sample.id }} durationInFrames={360} {...common} />)}
      <Composition id="MeadowMotionLab" component={MeadowMotionSheet} durationInFrames={360} {...common} />
      <Composition id="MotherFarewellLab" component={MotherFarewellSheet} durationInFrames={390} {...common} />
      <Composition id="RigMotionLab" component={RigMotionSheet} durationInFrames={240} {...common} />
      <Composition id="Cast" component={CastSheet} durationInFrames={1} {...common} />
      <Composition id="NewCast" component={NewCastSheet} durationInFrames={1} {...common} />
      <Composition id="FurnitureSheet" component={FurnitureSheet} durationInFrames={1} {...common} />
      <Composition id="VehicleSheet" component={VehicleSheet} durationInFrames={1} {...common} />
      <Composition id="OngLocShopSheet" component={OngLocShopSheet} durationInFrames={1} {...common} />
      <Composition id="MotherHouseSheet" component={MotherHouseSheet} durationInFrames={1} {...common} />
      <Composition id="OpeningC0Sheet" component={OpeningC0Sheet} durationInFrames={1} {...common} />
      <Composition id="MeadowAndDealsSheet" component={MeadowAndDealsSheet} durationInFrames={1} {...common} />
      <Composition id="TinNhanChuaGuiAnimatic" component={TinNhanChuaGuiAnimatic} durationInFrames={tinNhanTimeline.total} {...common} />
      <Composition id="ThuC1Tinh" component={ThuC1Tinh} durationInFrames={THU_C1_TOTAL} {...common} />
      <Composition id="ThuC1" component={ThuC1} durationInFrames={THU_C1_TOTAL} {...common} />
      <Composition id="ColorScriptSheet" component={ColorScriptSheet} durationInFrames={1} {...common} />
    </>
  );
};

