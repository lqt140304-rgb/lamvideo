import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { SHOTS } from './shots';

export const mua100C04 = defineEpisode('Mua100C04', { timeline: timeline as Timeline, shots: SHOTS });
