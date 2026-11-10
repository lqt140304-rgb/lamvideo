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
import { TimeVaultSheet } from './TimeVaultSheet';
import { TinNhanChuaGuiAnimatic } from './episodes/tin-nhan-chua-gui/animatic';
import tinNhanTimeline from './episodes/tin-nhan-chua-gui/timeline.json';
import { ThuC1, ThuC1Tinh, THU_C1_TOTAL } from './episodes/tin-nhan-chua-gui/thu-c1';
import { HoSo02CastBoard, HoSo02RigSheet, HoSo02Spin, HoSo02Turnaround, RIG_SHEET_TOTAL, SPIN_TOTAL } from './episodes/ho-so-02-nguoi-lam-thay/rig-sheet';
import { CANH01_TOTAL, HoSo02AnhSangThu, HoSo02Canh01Demo, LIGHT_TEST_TOTAL } from './episodes/ho-so-02-nguoi-lam-thay/canh-01-demo';

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
      <Composition id="HoSo02CastBoard" component={HoSo02CastBoard} durationInFrames={1} {...common} />
      <Composition id="HoSo02Turnaround" component={HoSo02Turnaround} durationInFrames={RIG_SHEET_TOTAL} {...common} />
      <Composition id="HoSo02Spin" component={HoSo02Spin} durationInFrames={SPIN_TOTAL} {...common} />
      <Composition id="HoSo02Canh01Demo" component={HoSo02Canh01Demo} durationInFrames={CANH01_TOTAL} {...common} />
      <Composition id="HoSo02AnhSangThu" component={HoSo02AnhSangThu} durationInFrames={LIGHT_TEST_TOTAL} {...common} />
      <Composition id="HoSo02RigSheet" component={HoSo02RigSheet} durationInFrames={RIG_SHEET_TOTAL} {...common} />
      <Composition id="ColorScriptSheet" component={ColorScriptSheet} durationInFrames={1} {...common} />
      <Composition id="TimeVaultSheet" component={TimeVaultSheet} durationInFrames={1} {...common} />
    </>
  );
};

