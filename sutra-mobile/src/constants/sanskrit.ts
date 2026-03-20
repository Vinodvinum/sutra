export const pillars = {
  discipline: { name: 'Tapas', sanskrit: 'तप', icon: '🔱', color: '#D4A853' },
  health: { name: 'Ārogya', sanskrit: 'आरोग्य', icon: '💚', color: '#52C97A' },
  finance: { name: 'Artha', sanskrit: 'अर्थ', icon: '💫', color: '#4E8FD4' },
  growth: { name: 'Vidyā', sanskrit: 'विद्या', icon: '🪷', color: '#7B5EA7' },
} as const;

export const scoreLabels = [
  { min: 0, label: 'Rebuilding', sanskrit: 'पुनर्निर्माण' },
  { min: 41, label: 'Building', sanskrit: 'निर्माण' },
  { min: 66, label: 'Disciplined', sanskrit: 'अनुशासित' },
  { min: 81, label: 'Elite', sanskrit: 'श्रेष्ठ' },
  { min: 93, label: 'Legendary', sanskrit: 'महान' },
] as const;

export const mantras = [
  {
    text: 'कर्म करो, फल की चिंता मत करो',
    translation: 'Act. Do not worry about results.',
    source: 'Bhagavad Gita 2.47',
  },
  {
    text: 'उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत',
    translation: 'Rise. Awaken. Seek the wise.',
    source: 'Katha Upanishad',
  },
  {
    text: 'धैर्यम् सर्वत्र साधनम्',
    translation: 'Patience is the means to everything.',
    source: 'Chanakya Niti',
  },
  {
    text: 'स्वधर्मे निधनं श्रेयः',
    translation: 'Better your own dharma, however imperfect.',
    source: 'Bhagavad Gita 3.35',
  },
  {
    text: 'योगः कर्मसु कौशलम्',
    translation: 'Yoga is excellence in action.',
    source: 'Bhagavad Gita 2.50',
  },
  {
    text: 'तमसो मा ज्योतिर्गमय',
    translation: 'Lead me from darkness to light.',
    source: 'Brihadaranyaka Upanishad',
  },
  {
    text: 'सत्यमेव जयते',
    translation: 'Truth alone triumphs.',
    source: 'Mundaka Upanishad',
  },
] as const;

export const navItems = [
  { key: 'home', label: 'HOME', symbol: '⊙' },
  { key: 'circles', label: 'CIRCLE', symbol: '◎' },
  { key: 'intel', label: 'INTEL', symbol: '◈' },
  { key: 'brahma', label: 'BRAHMA', symbol: '✦' },
  { key: 'finance', label: 'FINANCE', symbol: '◇' },
  { key: 'identity', label: 'SELF', symbol: '◉' },
] as const;
