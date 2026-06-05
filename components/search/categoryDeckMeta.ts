import {MateCategory} from '../../constants/mateCategories';

export type CategoryDeckMeta = {
  glyph: string;
  tagline: string;
  accent: string;
  accentSoft: string;
};

const DECK_PALETTE = [
  {accent: '#014569', soft: 'rgba(1, 69, 105, 0.14)'},
  {accent: '#026A94', soft: 'rgba(2, 106, 148, 0.14)'},
  {accent: '#2E7D6B', soft: 'rgba(46, 125, 107, 0.14)'},
  {accent: '#5B6BB5', soft: 'rgba(91, 107, 181, 0.14)'},
  {accent: '#B56B3A', soft: 'rgba(181, 107, 58, 0.14)'},
  {accent: '#9B4D6E', soft: 'rgba(155, 77, 110, 0.14)'},
  {accent: '#3D7A8E', soft: 'rgba(61, 122, 142, 0.14)'},
] as const;

const GLYPH_TAG: Record<string, {glyph: string; tagline: string}> = {
  shopping: {glyph: 'Sh', tagline: 'Errands & stores'},
  movie: {glyph: 'Mo', tagline: 'Cinema & shows'},
  timepass: {glyph: 'Tp', tagline: 'Hang out'},
  hospital: {glyph: 'Hp', tagline: 'Clinic visits'},
  talking: {glyph: 'Tk', tagline: 'Conversation'},
  travel: {glyph: 'Tr', tagline: 'Trips & rides'},
  home: {glyph: 'Hm', tagline: 'At-home help'},
  children: {glyph: 'Cc', tagline: 'Child care'},
  food: {glyph: 'Fd', tagline: 'Meals & cafes'},
  pub: {glyph: 'Pb', tagline: 'Social drinks'},
  vlog: {glyph: 'Vl', tagline: 'Content buddy'},
  language: {glyph: 'Ln', tagline: 'Practice speaking'},
  day: {glyph: 'Dy', tagline: 'Day plans'},
  other: {glyph: '••', tagline: 'Something else'},
};

export const shortCategoryLabel = (label: string) =>
  label.replace(/\s+Mate$/i, '').trim();

export const getCategoryDeckMeta = (
  category: MateCategory,
  index: number,
): CategoryDeckMeta => {
  const palette = DECK_PALETTE[index % DECK_PALETTE.length];
  const extra = GLYPH_TAG[category.id] ?? {
    glyph: shortCategoryLabel(category.label).slice(0, 2),
    tagline: 'Find a mate',
  };
  return {
    glyph: extra.glyph,
    tagline: extra.tagline,
    accent: palette.accent,
    accentSoft: palette.soft,
  };
};
