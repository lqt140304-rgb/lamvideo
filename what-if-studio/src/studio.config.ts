// The studio's settings. Every episode renders at this size and frame rate.
export const STUDIO = {
  fps: 30,
  width: 1920,
  height: 1080,
  /**
   * A local display face for titles, as a file in public/ (your brand font, say). null uses Bricolage Grotesque
   * from Google Fonts. Example: { family: 'My Brand Font', file: 'fonts/MyBrandFont.woff2', weight: '200 700' }
   */
  titleFont: null as null | { family: string; file: string; weight: string },
  /**
   * The language of the on-screen text. 'vi' loads faces that carry Vietnamese marks (Bricolage Grotesque with its
   * Vietnamese subset for titles, JetBrains Mono for readouts, Patrick Hand for chalk and notes); 'en' keeps the
   * original faces (Fragment Mono and Kalam have no Vietnamese).
   */
  lang: 'vi' as 'vi' | 'en',
};
