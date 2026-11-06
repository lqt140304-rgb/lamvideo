import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { SHOTS } from './shots';

export const mua100C03 = defineEpisode('Mua100C03', { timeline: timeline as Timeline, shots: SHOTS });
