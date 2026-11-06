import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { SHOTS } from './shots';

export const mua100C09 = defineEpisode('Mua100C09', { timeline: timeline as Timeline, shots: SHOTS });
