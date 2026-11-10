import React from 'react';

export const C = { ink: '#303b38', paper: '#f3eee2', cream: '#e2d5bd', wood: '#95704f', woodDark: '#5b4b3d', jade: '#68877a', jadeDark: '#344f49', blue: '#647b89', blueDark: '#334b59', gold: '#c89e58', rust: '#ac6e52', skin: '#dbad82', shade: '#bb8968', white: '#f7f4e9' };
export const FONT = 'Arial, sans-serif';
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const uid = () => `hs02-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
export const Label = ({ x, y, children, size = 20, color = C.ink, anchor = 'start' }: { x: number; y: number; children: React.ReactNode; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end' }) => <text x={x} y={y} fill={color} fontFamily={FONT} fontSize={size} textAnchor={anchor}>{children}</text>;
export const Sheet = ({ w = 1600, h = 1000, title, subtitle, children }: { w?: number; h?: number; title: string; subtitle?: string; children: React.ReactNode }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={title} strokeLinecap="round" strokeLinejoin="round"><rect width={w} height={h} fill={C.paper}/><Label x={44} y={49} size={29}>{title}</Label>{subtitle && <Label x={44} y={79} size={17} color="#64736c">{subtitle}</Label>}{children}</svg>;
export const Contact = ({ x = 0, y = 0, rx = 100 }: { x?: number; y?: number; rx?: number }) => <ellipse cx={x} cy={y} rx={rx} ry={rx * .085} fill="#3c463d" opacity={.15}/>;
export const Grain = () => <g fill="#f7ead0" opacity={.14}>{Array.from({ length: 18 }, (_, i) => <circle key={i} cx={(i * 197) % 1600} cy={(i * 113) % 900} r={1.3}/>)}</g>;
