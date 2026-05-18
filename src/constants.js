export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 640;

export const BLOCK_WIDTH = 80;
export const BLOCK_HEIGHT = 28;
export const PLATFORM_WIDTH = 110;
export const PLATFORM_HEIGHT = 18;
export const PLATFORM_Y = 555;   

export const CRANE_PIVOT_X = 180;
export const CRANE_PIVOT_Y = 85;
export const CRANE_ARM_LENGTH = 130;
export const ROPE_LENGTH = 55;

export const SCROLL_THRESHOLD_Y = 370;  

export const PHYSICS = {
  GRAVITY: 1800,
  MAX_ANGLE_START: 42,       
  MAX_ANGLE_LIMIT: 70,
  ANGLE_INCREMENT: 2,
  SPEED_START: 1.4,          
  SPEED_INCREMENT: 0.08,
  SPEED_LIMIT: 3.4,
  PERFECT_SPEED_REDUCTION: 0.32,
  PERFECT_SPEED_DURATION: 1.5,  
  BLOCK_LAG: 8,              
};

export const PLACEMENT = {
  PERFECT_MAX: 0.05,
  GOOD_MAX: 0.20,
  OK_MAX: 0.40,
  POOR_MAX: 0.60,
};

export const SCORING = {
  BASE: 100,
  MAX_PRECISION_BONUS: 200,
  COMBO_MULT_INCREMENT: 0.5,
};

export const BUILDING_CONFIG = {
  BLUE: {
    floors: 5,
    basePop: 150,
    adjacency: [],
    roofType: 'flat',
    label: 'Residential',
    colorBody: '#4A90D9',
    colorOutline: '#2C5F8A',
    colorHighlight: '#87C0F0',
    colorShadow: '#1A3A5A',
    colorWindow: '#FFE080',
  },
  RED: {
    floors: 8,
    basePop: 350,
    adjacency: ['BLUE'],
    roofType: 'angled',
    label: 'Commercial',
    colorBody: '#E05252',
    colorOutline: '#8B2020',
    colorHighlight: '#F07070',
    colorShadow: '#4A1010',
    colorWindow: '#80FFFF',
  },
  GREEN: {
    floors: 11,
    basePop: 750,
    adjacency: ['RED', 'BLUE'],
    roofType: 'pointed',
    label: 'Office',
    colorBody: '#52B952',
    colorOutline: '#2A6B2A',
    colorHighlight: '#7FD97F',
    colorShadow: '#1A3A1A',
    colorWindow: '#FFFFFF',
  },
  YELLOW: {
    floors: 15,
    basePop: 2000,
    adjacency: ['RED', 'BLUE', 'GREEN'],
    roofType: 'dome',
    label: 'Luxury',
    colorBody: '#F0C040',
    colorOutline: '#8B6A00',
    colorHighlight: '#FAE080',
    colorShadow: '#4A3A00',
    colorWindow: '#FFB0FF',
  },
};

export const CITY_LEVELS = [
  { name: 'Village',     min: 0     },
  { name: 'Town',        min: 500   },
  { name: 'City',        min: 2000  },
  { name: 'Big City',    min: 5000  },
  { name: 'Metropolis',  min: 10000 },
  { name: 'Megalopolis', min: 20000 },
  { name: 'World City',  min: 40000 },
];

export const GRID_SIZE = 5;
export const GRID_CELL_SIZE = 54;

export const SCENES = {
  MAIN_MENU: 'MAIN_MENU',
  MODE_SELECT: 'MODE_SELECT',
  QUICK_GAME: 'QUICK_GAME',
  BUILD_CITY: 'BUILD_CITY',
  STACKING: 'STACKING',
  GAME_OVER: 'GAME_OVER',
  HIGH_SCORES: 'HIGH_SCORES',
};

export const STORAGE = {
  QUICK_HS: 'cityBloxx_quickGameHS',
  BUILD_HS: 'cityBloxx_buildCityHS',
  CITY_STATE: 'cityBloxx_cityState',
  AUDIO: 'cityBloxx_audioEnabled',
  AUDIO_MUSIC: 'cityBloxx_musicEnabled',
};

export const COLORS = {
  SKY_TOP: '#06060F',
  SKY_MID: '#0D1B3E',
  SKY_LOW: '#1E3A6E',
  HORIZON: '#2E5A8E',

  GROUND: '#1A3010',
  GROUND_LIGHT: '#2A4A1A',

  CRANE_METAL: '#B0B0B0',
  CRANE_DARK: '#606060',
  CRANE_ROPE: '#C89838',
  CRANE_SUPPORT: '#909090',

  PLATFORM_BODY: '#9B7920',
  PLATFORM_DARK: '#6A5010',
  PLATFORM_LIGHT: '#C4A050',

  WHITE: '#FFFFFF',
  BLACK: '#000000',
  UI_BG: '#08081A',
  UI_PANEL: '#12122A',
  UI_BORDER: '#3A3A7A',
  UI_TEXT: '#D0D0FF',
  UI_ACCENT: '#FFD700',
  UI_ACCENT2: '#FF8C00',

  STAR: '#FFFFFF',
  MOON: '#E8E0A0',
  CLOUD: '#D0E0F0',

  WINDOW_LIT: '#FFE080',
  WINDOW_DARK: '#1A1A3A',

  PERFECT_GLOW: '#FFFF80',
};

export const MAX_DELTA = 1 / 20;
