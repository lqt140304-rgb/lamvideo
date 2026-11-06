import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { SHOTS } from './shots';

export const mua100C06 = defineEpisode('Mua100C06', { timeline: timeline as Timeline, shots: SHOTS });
