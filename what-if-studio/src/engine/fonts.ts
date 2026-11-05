import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadMono } from '@remotion/google-fonts/FragmentMono';
import { loadFont as loadHand } from '@remotion/google-fonts/Kalam';
import { loadFont as loadMonoVi } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadHandVi } from '@remotion/google-fonts/PatrickHand';
import { STUDIO } from '../studio.config';

// Three faces: a heavy display face for the title card, a mono for on-screen readouts (timers, labels, chips),
// and a handwriting face for chalk and notes. The Google faces load at render time (they need a connection);
// a local title face from studio.config.ts loads from public/ and works offline.

const VI = STUDIO.lang === 'vi';
if (VI) {
  loadBricolage('normal', { weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext', 'vietnamese'] });
  loadMonoVi('normal', { weights: ['400'], subsets: ['latin', 'latin-ext', 'vietnamese'] });
  loadHandVi('normal', { weights: ['400'], subsets: ['latin', 'latin-ext', 'vietnamese'] });
} else {
  loadBricolage('normal', { weights: ['600', '700', '800'], subsets: ['latin'] });
  loadMono('normal', { weights: ['400'], subsets: ['latin'] });
  loadHand('normal', { weights: ['400', '700'], subsets: ['latin'] });
}
if (STUDIO.titleFont) loadFont({ family: STUDIO.titleFont.family, url: staticFile(STUDIO.titleFont.file), weight: STUDIO.titleFont.weight });

export const FONT = {
  title: STUDIO.titleFont ? STUDIO.titleFont.family : 'Bricolage Grotesque',
  ui: VI ? 'JetBrains Mono' : 'Fragment Mono',
  hand: VI ? 'Patrick Hand' : 'Kalam',
};
