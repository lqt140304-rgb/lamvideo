import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { SHOTS } from './shots';

export const mua100C01 = defineEpisode('Mua100C01', { timeline: timeline as Timeline, shots: SHOTS });
