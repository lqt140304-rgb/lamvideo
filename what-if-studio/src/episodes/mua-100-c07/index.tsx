import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { SHOTS } from './shots';

export const mua100C07 = defineEpisode('Mua100C07', { timeline: timeline as Timeline, shots: SHOTS });
