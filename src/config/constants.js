/**
 * App Configuration Constants
 * Centralize all app config values here
 */

// User & Game Data
export const INITIAL_USER_STATE = {
  name: 'Arjun',
  xp: 1240,
  level: 8,
  levelName: 'Word Weaver',
  streak: 7,
  hearts: 3,
}

// Progress & Goals
export const DAILY_GOAL = {
  current: 6,
  total: 10,
}

export const XP_PROGRESS = {
  current: 1240,
  needed: 1700,
}

// Sample Words Data
export const RECENT_WORDS = [
  {
    id: 1,
    tamil: 'ஆறு',
    roman: 'aaru',
    partOfSpeech: ['noun', 'noun', 'verb'],
    meanings: ['river', 'six', 'to calm/comfort'],
    progress: 65,
    colorIndex: 0,
  },
  {
    id: 2,
    tamil: 'படி',
    roman: 'padi',
    partOfSpeech: ['noun', 'verb'],
    meanings: ['step', 'to study'],
    progress: 42,
    colorIndex: 2,
  },
  {
    id: 3,
    tamil: 'கல்',
    roman: 'kal',
    partOfSpeech: ['noun', 'verb'],
    meanings: ['stone', 'to learn'],
    progress: 20,
    colorIndex: 1,
  },
  {
    id: 4,
    tamil: 'திங்கள்',
    roman: 'thingal',
    partOfSpeech: ['noun', 'noun', 'noun'],
    meanings: ['moon', 'Monday', 'month'],
    progress: 88,
    colorIndex: 0,
  },
]

// Color Palette Mapping
export const COLORS = {
  0: 'mohi-teal',
  1: 'mohi-gold',
  2: 'mohi-purple',
  3: 'mohi-coral',
}

// Sense Data
export const SENSES = {
  nounRiver: {
    id: 'noun-river',
    word: 'ஆறு',
    pos: 'Noun',
    meaning: 'river',
    example: 'மீனவர் ஆற்றில் மீன் பிடித்தார்.',
    exampleEn: 'The fisherman caught fish in the river.',
  },
  verbComfort: {
    id: 'verb-comfort',
    word: 'ஆற',
    pos: 'Verb',
    meaning: 'to calm, comfort',
    example: 'அம்மா குழந்தையை ஆற முயன்றாள்.',
    exampleEn: 'Mother tried to comfort the child.',
  },
  nounSix: {
    id: 'noun-six',
    word: 'ஆறு',
    pos: 'Noun',
    meaning: 'six',
    example: 'ஆறு பூ பட்டையுண்டு.',
    exampleEn: 'There are six flowers in the garden.',
  },
}

// Challenge Review Items
export const CHALLENGE_REVIEW = [
  { word: 'ஆற்றில்', sense: 'locative · river sense', correct: true },
  { word: 'ஆறுகிறாள்', sense: 'present tense · comfort sense', correct: true },
  { word: 'ஆறாக', sense: 'confused verb ↔ noun sense', correct: false },
  { word: 'ஆறாவது', sense: 'ordinal · six sense', correct: true },
]

// Navigation Tabs
export const NAV_TABS = [
  { id: 'home', label: 'HOME', icon: '🏠' },
  { id: 'play', label: 'PLAY', icon: '⚡' },
  { id: 'explore', label: 'EXPLORE', icon: '🕸️' },
  { id: 'profile', label: 'PROFILE', icon: '👤' },
]

// Animation Delays
export const ANIMATIONS = {
  resultEmoji: 0.15,
  feedbackCard: 0.25,
}
