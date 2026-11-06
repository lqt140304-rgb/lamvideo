import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import captions from './captions.json';
import { SHOTS } from './shots';

export const mua100C02 = defineEpisode('Mua100C02', { captions, timeline: timeline as Timeline, shots: SHOTS });
