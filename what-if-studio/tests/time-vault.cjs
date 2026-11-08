// node tests/time-vault.cjs — Verification tests for Entity 01 (Clock Creature) and the Time Vault.
require('./shared-assets.cjs'); // registers the TypeScript loader
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const tv = require('../src/engine/sets/time_vault');

let count = 0;
const check = (ok, msg) => { count++; assert.ok(ok, msg); };

// 1. Export check
const requiredExports = [
  'ClockCreature',
  'MemoryJar',
  'ReverseHourglass',
  'ReverseClockwork',
  'TimeVaultScene',
  'AntiquePortraitCameo',
  'CameoJars',
  'AlleyWithoutShop',
];
for (const exp of requiredExports) {
  check(typeof tv[exp] === 'function', `Export ${exp} is a function`);
}

// 2. Finite geometry rendering without NaN/undefined
for (const t of [0, 15, 60, 120]) {
  // ClockCreature
  const ccSvg = renderToStaticMarkup(React.createElement('svg', null, React.createElement(tv.ClockCreature, { x: 500, y: 500, s: 1, t })));
  check(!/NaN|Infinity|undefined/.test(ccSvg), `ClockCreature @t=${t} renders finite geometry`);
  check(ccSvg.includes('circle') && ccSvg.includes('path'), 'ClockCreature contains expected SVG elements');

  // MemoryJar with G1, G2, G3
  for (const kind of ['g1', 'g2', 'g3', 'dormant']) {
    const jarSvg = renderToStaticMarkup(React.createElement('svg', null, React.createElement(tv.MemoryJar, { x: 100, y: 100, kind, t })));
    check(!/NaN|Infinity|undefined/.test(jarSvg), `MemoryJar ${kind} @t=${t} renders finite geometry`);
  }

  // ReverseHourglass
  const hgSvg = renderToStaticMarkup(React.createElement('svg', null, React.createElement(tv.ReverseHourglass, { x: 200, y: 200, t })));
  check(!/NaN|Infinity|undefined/.test(hgSvg), `ReverseHourglass @t=${t} renders finite geometry`);

  // TimeVaultScene
  const vaultSvg = renderToStaticMarkup(React.createElement('svg', null, React.createElement(tv.TimeVaultScene, { t })));
  check(!/NaN|Infinity|undefined/.test(vaultSvg), `TimeVaultScene @t=${t} renders finite geometry`);

  // AlleyWithoutShop
  const alleySvg = renderToStaticMarkup(React.createElement('svg', null, React.createElement(tv.AlleyWithoutShop, { t })));
  check(!/NaN|Infinity|undefined/.test(alleySvg), `AlleyWithoutShop @t=${t} renders finite geometry`);
}

console.log('Time Vault & Clock Creature checks passed:', count);
