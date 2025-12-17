export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

export const GRAVITY = 0.6;
export const JUMP_FORCE = -14; // Increased jump force for bigger characters
export const GROUND_Y = 380;

// INCREASED SIZES
export const PLAYER_SIZE = 80; 
export const PLAYER_DEFAULT_X = 150; 
export const DOG_X = 10; 
export const DOG_SIZE = 75; 

export const INITIAL_SPEED = 6;
export const MAX_SPEED = 20; 
export const SPEED_INCREMENT = 0.001; 

export const OBSTACLE_SPAWN_RATE_MIN = 60; 
export const OBSTACLE_SPAWN_RATE_MAX = 120;

export const COLORS = {
  sky: '#87CEEB',
  ground: '#8D6E63', // Earthy color for path
  groundDark: '#5D4037',
  player: '#FF5722',
  playerInvincible: '#FFEB3B',
  playerShield: '#2196F3',
  dog: '#795548', 
  dogCollar: '#F44336',
  
  // Vietnamese Obstacles
  waterDitch: '#4FC3F7', // Mương nước
  haystack: '#FFD54F',   // Đống rơm
  electricPole: '#9E9E9E', // Cột điện
  tricycle: '#0288D1',    // Xe ba gác
  buffalo: '#424242',     // Trâu
  bird: '#E91E63',        // Chim
  
  coin: '#FFD700',
  text: '#FFFFFF',
  
  // Power Ups
  buffShield: '#29B6F6',
  buffMagnet: '#F44336',
  buffFever: '#E040FB'
};

export const PARTICLE_COUNT = 10;
export const GEMINI_MODEL_ID = "gemini-2.5-flash";