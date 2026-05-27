export const CATEGORIES = {
  rruge_deme:      { label: 'Dëmtim Rruge',        labelEN: 'Road Damage',         emoji: '🕳️',  color: '#E24B4A' },
  ndricim:         { label: 'Ndriçim i Prishur',    labelEN: 'Broken Lights',       emoji: '💡',  color: '#EF9F27' },
  mbeturina:       { label: 'Mbeturina Ilegale',    labelEN: 'Illegal Dumping',     emoji: '🗑️',  color: '#8B4513' },
  trotuare:        { label: 'Trotuare të Bllokuara', labelEN: 'Blocked Pavements',  emoji: '🚶',  color: '#534AB7' },
  uji_kanalizimi:  { label: 'Ujë / Kanalizim',      labelEN: 'Water / Sewage',      emoji: '💧',  color: '#185FA5' },
  ndertim_ilegal:  { label: 'Ndërtim Ilegal',       labelEN: 'Illegal Construction',emoji: '🏗️', color: '#FF6B35' },
  parkimi:         { label: 'Parkim Ilegal',         labelEN: 'Illegal Parking',     emoji: '🚗',  color: '#CC0000' },
  pemve_parqe:     { label: 'Pemë / Parqe',          labelEN: 'Trees / Parks',       emoji: '🌳',  color: '#1D9E75' },
  tjeter:          { label: 'Tjetër',                labelEN: 'Other',               emoji: '📋',  color: '#888888' },
} as const

export type CategoryKey = keyof typeof CATEGORIES

export const STATUS_LABELS = {
  raportuar: { label: 'Raportuar',    color: '#888888', bg: '#F3F3F3' },
  shqyrtim:  { label: 'Në Shqyrtim', color: '#EF9F27', bg: '#FAEEDA' },
  ne_proces: { label: 'Në Proces',   color: '#185FA5', bg: '#E6F1FB' },
  zgjidhur:  { label: 'Zgjidhur',    color: '#1D9E75', bg: '#E1F5EE' },
  refuzuar:  { label: 'Refuzuar',    color: '#E24B4A', bg: '#FCEBEB' },
} as const

export type StatusKey = keyof typeof STATUS_LABELS

export const MUNICIPALITIES = [
  'Prishtinë', 'Prizren', 'Pejë', 'Mitrovicë', 'Ferizaj',
  'Gjilan', 'Gjakovë', 'Podujevo', 'Vushtrri', 'Suharekë',
  'Rahovec', 'Drenas', 'Lipjan', 'Malishevë', 'Klinë',
  'Skenderaj', 'Istog', 'Deçan', 'Junik', 'Hani i Elezit',
  'Shtërpcë', 'Novo Brdo', 'Ranilug', 'Klokot', 'Partesh',
  'Graçanicë', 'Mitrovicë e Veriut', 'Leposaviq', 'Zveçan', 'Zubin Potok',
]

export const KOSOVO_CENTER: [number, number] = [42.6026, 20.9030]
export const KOSOVO_DEFAULT_ZOOM = 9
