import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
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

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast, NewCast, FurnitureSheet, VehicleSheet, OngLocShopSheet, MotherHouseSheet, OpeningC0Sheet, and MeadowAndDealsSheet render the studio asset sheets.
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
      <Composition id="Cast" component={CastSheet} durationInFrames={1} {...common} />
      <Composition id="NewCast" component={NewCastSheet} durationInFrames={1} {...common} />
      <Composition id="FurnitureSheet" component={FurnitureSheet} durationInFrames={1} {...common} />
      <Composition id="VehicleSheet" component={VehicleSheet} durationInFrames={1} {...common} />
      <Composition id="OngLocShopSheet" component={OngLocShopSheet} durationInFrames={1} {...common} />
      <Composition id="MotherHouseSheet" component={MotherHouseSheet} durationInFrames={1} {...common} />
      <Composition id="OpeningC0Sheet" component={OpeningC0Sheet} durationInFrames={1} {...common} />
      <Composition id="MeadowAndDealsSheet" component={MeadowAndDealsSheet} durationInFrames={1} {...common} />
    </>
  );
};

