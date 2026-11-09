import React, { useLayoutEffect, useRef } from 'react';

// Every set, prop and character in the film is drawn with near-black ink outlines. Re-authoring thousands of shapes is not
// needed to change that: after each frame is drawn, each dark outline on a filled shape becomes a thin edge 18% darker than
// its own fill. Open strokes (brows, eyelids, mouths, wires) are left alone, they are drawing and not outline.
const lum = (h: number[]) => (0.3 * h[0] + 0.59 * h[1] + 0.11 * h[2]) / 255;
const parse = (c: string | null) => {
  if (!c) return null;
  const m = c.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const css = (rgb: number[], k: number) => `rgb(${rgb.map((v) => Math.round(v * k)).join(',')})`;

export const Lineless: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const root = useRef<SVGGElement>(null);
  useLayoutEffect(() => {
    root.current?.querySelectorAll<SVGElement>('[stroke]').forEach((el) => {
      const stroke = parse(el.getAttribute('stroke'));
      const fillAttr = el.getAttribute('fill');
      const ink = stroke && lum(stroke) < 0.17 && fillAttr && fillAttr !== 'none';
      if (!ink) {
        if (el.dataset.toned) { el.style.removeProperty('stroke'); el.style.removeProperty('stroke-width'); el.style.removeProperty('vector-effect'); delete el.dataset.toned; }
        return;
      }
      const fill = parse(fillAttr);
      // Very pale shapes (eye whites, paper) would lose their edge at 18%, so they go deeper. Gradients take a neutral dark.
      const edge = fill ? css(fill, lum(fill) > 0.78 ? 0.5 : 0.82) : 'rgb(58,48,50)';
      el.style.setProperty('stroke', edge);
      el.style.setProperty('stroke-width', '1.6');
      el.style.setProperty('vector-effect', 'non-scaling-stroke');
      el.dataset.toned = '1';
    });
  });
  return <g ref={root}>{children}</g>;
};
