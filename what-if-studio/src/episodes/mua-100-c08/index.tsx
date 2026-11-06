import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import captions from './captions.json';
import { SHOTS } from './shots';

export const mua100C08 = defineEpisode('Mua100C08', { captions, timeline: timeline as Timeline, shots: SHOTS });
