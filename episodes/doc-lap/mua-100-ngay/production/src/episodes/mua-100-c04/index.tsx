import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import captions from './captions.json';
import { SHOTS } from './shots';

export const mua100C04 = defineEpisode('Mua100C04', { captions, timeline: timeline as Timeline, shots: SHOTS });
