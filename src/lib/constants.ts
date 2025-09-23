import type { City } from './types';

export const CITIES: City[] = [
  { name: 'Casablanca' },
  { name: 'Tetouane' },
];

export const LINE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA', 
  '#F0B37E', '#8D9EC6', '#E5989B', '#6D4C41', '#C0CA33'
];

export function getLineColor(lineId: number): string {
  return LINE_COLORS[lineId % LINE_COLORS.length];
}
