export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export enum ObstacleType {
  WATER_DITCH = 'WATER_DITCH', // Mương nước
  HAYSTACK = 'HAYSTACK',       // Đống rơm
  ELECTRIC_POLE = 'ELECTRIC_POLE', // Cột điện
  TRICYCLE = 'TRICYCLE',       // Xe ba gác
  BUFFALO = 'BUFFALO',         // Trâu
  BIRD = 'BIRD'                // Chim
}

export enum PowerUpType {
  SHIELD = 'SHIELD',
  MAGNET = 'MAGNET',
  FEVER = 'FEVER'
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Entity extends Rect {
  vx: number;
  vy: number;
  color: string;
}

export interface Player extends Entity {
  isJumping: boolean;
  isGrounded: boolean;
  doubleJumpAvailable: boolean;
  jumpCount: number;
  invincible: boolean;
  invincibleTimer: number;
  // Buff states
  hasShield: boolean;
  magnetTimer: number;
  feverTimer: number;
  targetX: number;
  // Animation
  runFrame: number;
  jumpFrame: number;
  animTimer: number;
}

export interface Dog extends Entity {
  frame: number;
  animTimer: number;
}

export interface Obstacle extends Rect {
  type: ObstacleType;
  passed: boolean;
  // Animation
  frame: number;
  animTimer: number;
}

export interface PowerUp extends Rect {
  type: PowerUpType;
  collected: boolean;
  wobbleOffset: number;
}

export interface Particle extends Entity {
  life: number;
  maxLife: number;
}

export interface Coin extends Rect {
  collected: boolean;
  wobbleOffset: number;
  beingAttracted?: boolean;
}

export interface GameStats {
  score: number;
  coins: number;
  distance: number;
}

export interface GeminiAnalysis {
  title: string;
  comment: string;
}