import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { SHOTS } from './shots';

export const mua100C10 = defineEpisode('Mua100C10', { timeline: timeline as Timeline, shots: SHOTS });
