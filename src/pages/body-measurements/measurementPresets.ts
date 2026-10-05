/**
 * The backend stores measurements as free-form name/value pairs.
 * Using a fixed list of names keeps the series consistent for the charts.
 */
export const MEASUREMENT_PRESETS = [
  { name: 'Peso', unit: 'kg' },
  { name: 'Altura', unit: 'cm' },
  { name: '% Gordura', unit: '%' },
  { name: 'Peito', unit: 'cm' },
  { name: 'Cintura', unit: 'cm' },
  { name: 'Quadril', unit: 'cm' },
  { name: 'Braço', unit: 'cm' },
  { name: 'Coxa', unit: 'cm' },
  { name: 'Panturrilha', unit: 'cm' },
] as const

export function unitOf(name: string): string {
  return MEASUREMENT_PRESETS.find((p) => p.name === name)?.unit ?? ''
}
