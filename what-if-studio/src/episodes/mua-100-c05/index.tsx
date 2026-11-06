import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { SHOTS } from './shots';

export const mua100C05 = defineEpisode('Mua100C05', { timeline: timeline as Timeline, shots: SHOTS });
