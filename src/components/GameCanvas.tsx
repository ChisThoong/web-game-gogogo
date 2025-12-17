import React, { useRef, useEffect, useCallback } from 'react';
import { 
  GameState, 
  Player, 
  Dog,
  Obstacle, 
  ObstacleType, 
  PowerUp, 
  PowerUpType, 
  Coin, 
  Particle, 
  GameStats, 
  Rect 
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  GROUND_Y, 
  PLAYER_SIZE, 
  PLAYER_DEFAULT_X, 
  DOG_X, 
  DOG_SIZE, 
  INITIAL_SPEED, 
  MAX_SPEED, 
  SPEED_INCREMENT, 
  COLORS 
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  updateStats: (stats: GameStats) => void;
  triggerShake: () => void;
  onGameOver: () => void;
}

// Helper to manage loaded images
type ImageStore = {
  bg: HTMLImageElement | null;
  playerRun: HTMLImageElement[];
  playerJump: HTMLImageElement[];
  dogRun: HTMLImageElement[];
  obstacles: Record<ObstacleType, HTMLImageElement[]>;
  items: Record<string, HTMLImageElement[]>;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  updateStats, 
  triggerShake,
  onGameOver
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  
  // Image Resources Ref
  const imagesRef = useRef<ImageStore>({
    bg: null,
    playerRun: [],
    playerJump: [],
    dogRun: [],
    obstacles: {
      [ObstacleType.WATER_DITCH]: [],
      [ObstacleType.HAYSTACK]: [],
      [ObstacleType.ELECTRIC_POLE]: [],
      [ObstacleType.TRICYCLE]: [],
      [ObstacleType.BUFFALO]: [],
      [ObstacleType.BIRD]: [],
    },
    items: {
      coin: [],
      shield: [],
      magnet: [],
      fever: []
    }
  });
  
  // Game State Refs
  const playerRef = useRef<Player>({
    x: PLAYER_DEFAULT_X,
    y: GROUND_Y - PLAYER_SIZE,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    vx: 0,
    vy: 0,
    color: COLORS.player,
    isJumping: false,
    isGrounded: true,
    doubleJumpAvailable: true,
    jumpCount: 0,
    invincible: false,
    invincibleTimer: 0,
    hasShield: false,
    magnetTimer: 0,
    feverTimer: 0,
    targetX: PLAYER_DEFAULT_X,
    runFrame: 0,
    jumpFrame: 0,
    animTimer: 0
  });

  const dogRef = useRef<Dog>({
    x: DOG_X,
    y: GROUND_Y - DOG_SIZE,
    width: DOG_SIZE,
    height: DOG_SIZE,
    vx: 0,
    vy: 0,
    color: COLORS.dog,
    frame: 0,
    animTimer: 0
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const gameSpeedRef = useRef<number>(INITIAL_SPEED);
  const scoreRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const coinsCollectedRef = useRef<number>(0);
  const bgOffsetRef = useRef<number>(0);

  // Load Images Effect
  useEffect(() => {
    const loadFrame = (path: string): HTMLImageElement => {
      const img = new Image();
      img.src = path;
      return img;
    };

    // Background
    const bgImg = new Image();
    bgImg.src = '/bg/rice-field.png';
    imagesRef.current.bg = bgImg;

    // 1. Player Run (4 frames)
    for (let i = 1; i <= 4; i++) {
      imagesRef.current.playerRun.push(loadFrame(`/player/player-run-${i}.png`));
    }
    // 2. Player Jump (4 frames)
    for (let i = 1; i <= 4; i++) {
      imagesRef.current.playerJump.push(loadFrame(`/player/player-run-${i}.png`));
    }

    // 3. Dog Run (4 frames)
    for (let i = 1; i <= 4; i++) {
      imagesRef.current.dogRun.push(loadFrame(`/dog/dog-run-${i}.png`));
    }

    // 4. Obstacles (Vietnamese Theme)
    // Animated: Bird, Buffalo
    for (let i = 1; i <= 4; i++) {
      imagesRef.current.obstacles[ObstacleType.BIRD].push(loadFrame(`/obstacles/bird-${i}.png`));
      imagesRef.current.obstacles[ObstacleType.BUFFALO].push(loadFrame(`/obstacles/buffalo-${i}.png`));
    }
    // Static
    imagesRef.current.obstacles[ObstacleType.WATER_DITCH].push(loadFrame(`/obstacles/ditch.png`));
    imagesRef.current.obstacles[ObstacleType.HAYSTACK].push(loadFrame(`/obstacles/haystack.png`));
    imagesRef.current.obstacles[ObstacleType.ELECTRIC_POLE].push(loadFrame(`/obstacles/pole.png`));
    imagesRef.current.obstacles[ObstacleType.TRICYCLE].push(loadFrame(`/obstacles/tricycle.png`));

    // 5. Items
    imagesRef.current.items.coin.push(loadFrame(`/items/coin.png`));
    imagesRef.current.items.shield.push(loadFrame(`/items/shield.png`));
    imagesRef.current.items.magnet.push(loadFrame(`/items/magnet.png`));
    imagesRef.current.items.fever.push(loadFrame(`/items/star.png`));

  }, []);

  // Initialize/Reset Game
  const resetGame = useCallback(() => {
    playerRef.current = {
      x: PLAYER_DEFAULT_X,
      y: GROUND_Y - PLAYER_SIZE,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      vx: 0,
      vy: 0,
      color: COLORS.player,
      isJumping: false,
      isGrounded: true,
      doubleJumpAvailable: true,
      jumpCount: 0,
      invincible: false,
      invincibleTimer: 0,
      hasShield: false,
      magnetTimer: 0,
      feverTimer: 0,
      targetX: PLAYER_DEFAULT_X,
      runFrame: 0,
      jumpFrame: 0,
      animTimer: 0
    };
    dogRef.current.x = DOG_X;
    
    obstaclesRef.current = [];
    coinsRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    
    gameSpeedRef.current = INITIAL_SPEED;
    scoreRef.current = 0;
    distanceRef.current = 0;
    coinsCollectedRef.current = 0;
    bgOffsetRef.current = 0;
    frameCountRef.current = 0;
  }, []);

  // Controls
  const handleJump = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    
    const player = playerRef.current;
    
    if (player.isGrounded) {
      player.vy = JUMP_FORCE;
      player.isGrounded = false;
      player.isJumping = true;
      player.jumpCount = 1;
      createParticles(player.x + player.width/2, player.y + player.height, COLORS.ground, 5);
    } else if (player.doubleJumpAvailable && player.jumpCount < 2) {
      player.vy = JUMP_FORCE * 0.8;
      player.jumpCount = 2;
      player.doubleJumpAvailable = false;
      createParticles(player.x + player.width/2, player.y + player.height, '#fff', 3);
    }
  }, [gameState]);

  const handleInput = useCallback((e: KeyboardEvent | TouchEvent) => {
    if (e.type === 'keydown') {
      if ((e as KeyboardEvent).code === 'Space' || (e as KeyboardEvent).code === 'ArrowUp') {
        handleJump();
      }
    } else if (e.type === 'touchstart') {
      handleJump();
    }
  }, [handleJump]);

  // Particle System
  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color: color,
        life: 1.0,
        maxLife: 1.0
      });
    }
  };

  // Collision Detection
  const checkCollision = (rect1: Rect, rect2: Rect) => {
    // Shrink hitboxes slightly to be forgiving for bigger sprites
    const buffer = 10;
    return (
      rect1.x + buffer < rect2.x + rect2.width - buffer &&
      rect1.x + rect1.width - buffer > rect2.x + buffer &&
      rect1.y + buffer < rect2.y + rect2.height - buffer &&
      rect1.y + rect1.height > rect2.y + buffer
    );
  };

  // Main Loop
  const loop = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Screen
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- LOGIC ---
    if (gameState === GameState.PLAYING) {
      frameCountRef.current++;
      
      const p = playerRef.current;
      const dog = dogRef.current;

      // --- ANIMATION TICKS ---
      p.animTimer++;
      if (p.animTimer >= 8) {
        p.animTimer = 0;
        if (p.isGrounded) {
          p.runFrame = (p.runFrame + 1) % 4;
        } else {
          p.jumpFrame = (p.jumpFrame + 1) % 4;
        }
      }

      dog.animTimer++;
      if (dog.animTimer >= 8) {
        dog.animTimer = 0;
        dog.frame = (dog.frame + 1) % 4;
      }

      // Handle Buff Timers
      if (p.feverTimer > 0) p.feverTimer--;
      if (p.magnetTimer > 0) p.magnetTimer--;
      if (p.invincibleTimer > 0) p.invincibleTimer--;

      // Fever Mode Speed
      let currentSpeed = gameSpeedRef.current;
      if (p.feverTimer > 0) {
        currentSpeed *= 1.5; 
        p.invincible = true;
      } else {
        p.invincible = p.invincibleTimer > 0;
      }

      // Update Base Speed
      if (gameSpeedRef.current < MAX_SPEED) {
        gameSpeedRef.current += SPEED_INCREMENT;
      }
      
      // Update Distance & Score
      distanceRef.current += currentSpeed * 0.1;
      scoreRef.current = Math.floor(distanceRef.current + (coinsCollectedRef.current * 50));
      updateStats({
        score: scoreRef.current,
        coins: coinsCollectedRef.current,
        distance: Math.floor(distanceRef.current)
      });

      // --- PLAYER PHYSICS & RECOVERY ---
      p.vy += GRAVITY;
      p.y += p.vy;

      // Recovery
      if (p.x < p.targetX) {
        p.x += 0.5; 
      } else if (p.x > p.targetX) {
        p.x -= 0.5;
      }

      // Ground Collision
      if (p.y + p.height >= GROUND_Y) {
        p.y = GROUND_Y - p.height;
        p.vy = 0;
        p.isGrounded = true;
        p.isJumping = false;
        p.doubleJumpAvailable = true;
        p.jumpCount = 0;
      } else {
        p.isGrounded = false;
      }

      // DOG KILL CONDITION
      if (checkCollision(p, dog)) {
         triggerShake();
         onGameOver();
         setGameState(GameState.GAME_OVER);
         createParticles(p.x, p.y, COLORS.player, 30);
      }

      // --- SPAWNING ---
      const minSpawnDist = 250 + (currentSpeed * 10); // More space for bigger items
      const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
      const canSpawn = !lastObstacle || (CANVAS_WIDTH - lastObstacle.x > minSpawnDist);
      
      if (canSpawn && Math.random() < 0.03) {
        const typeRoll = Math.random();
        let type = ObstacleType.HAYSTACK;
        let width = 60;
        let height = 60;
        let y = GROUND_Y - 60;

        // VIETNAMESE THEME ODDS
        if (typeRoll > 0.85) { // 15% Electric Pole
           type = ObstacleType.ELECTRIC_POLE;
           width = 100; height = 160; y = GROUND_Y - 160;
        } else if (typeRoll > 0.70) { // 15% Bird
           type = ObstacleType.BIRD;
           width = 50; height = 40; y = GROUND_Y - 100 - (Math.random() * 50);
        } else if (typeRoll > 0.55) { // 15% Tricycle
           type = ObstacleType.TRICYCLE;
           width = 120; height = 100; y = GROUND_Y - 100;
        } else if (typeRoll > 0.40) { // 15% Buffalo
           type = ObstacleType.BUFFALO;
           width = 120; height = 80; y = GROUND_Y - 80;
        } else if (typeRoll > 0.25) { // 15% Water Ditch
           type = ObstacleType.WATER_DITCH;
           width = 70; height = 20; y = GROUND_Y + 10; // Slightly below ground to look like hole
        } else { // 25% Haystack
           type = ObstacleType.HAYSTACK;
           width = 100; height = 100; y = GROUND_Y - 100;
        }

        obstaclesRef.current.push({
          x: CANVAS_WIDTH + 50,
          y,
          width,
          height,
          type,
          passed: false,
          frame: 0,
          animTimer: 0
        });

        // Spawn Coin or PowerUp
        const itemRoll = Math.random();
        if (itemRoll > 0.95) { // 5% PowerUp
           const puRoll = Math.random();
           let puType = PowerUpType.SHIELD;
           if (puRoll > 0.7) puType = PowerUpType.FEVER;
           else if (puRoll > 0.4) puType = PowerUpType.MAGNET;

           powerUpsRef.current.push({
             x: CANVAS_WIDTH + 50 + width + 100,
             y: GROUND_Y - 50 - Math.random() * 80,
             width: 30,
             height: 30,
             type: puType,
             collected: false,
             wobbleOffset: Math.random() * Math.PI
           });

        } else if (itemRoll > 0.5) { // 45% Coin
           coinsRef.current.push({
             x: CANVAS_WIDTH + 50 + width + 50 + (Math.random() * 100),
             y: GROUND_Y - 40 - (Math.random() * 100),
             width: 20,
             height: 20,
             collected: false,
             wobbleOffset: Math.random() * Math.PI * 2
           });
        }
      }

      // --- UPDATES ---

      // Obstacles Logic
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.x -= currentSpeed;
        
        // Update Obstacle Animation
        obs.animTimer++;
        if (obs.animTimer >= 8) {
          obs.animTimer = 0;
          obs.frame = (obs.frame + 1) % 4;
        }

        if (checkCollision(p, obs)) {
           // If Fever or Shield, destroy obstacle or ignore
           if (p.feverTimer > 0) {
              createParticles(obs.x + obs.width/2, obs.y + obs.height/2, '#fff', 10);
              obstaclesRef.current.splice(i, 1);
              continue;
           } else if (p.hasShield) {
              p.hasShield = false;
              p.invincibleTimer = 60; 
              createParticles(p.x, p.y, COLORS.buffShield, 15);
              p.vy = -5;
              obstaclesRef.current.splice(i, 1);
              continue;
           } else if (!p.invincible) {
              // KNOCKBACK LOGIC
              triggerShake();
              
              // Push player back towards Dog
              p.x -= 60; 
              p.vy = -5; 
              p.invincibleTimer = 40; 
              
              // Water Effect
              if (obs.type === ObstacleType.WATER_DITCH) {
                 createParticles(p.x + p.width/2, p.y + p.height, COLORS.waterDitch, 10);
              } else {
                 createParticles(p.x + p.width/2, p.y + p.height/2, COLORS.player, 5);
              }
           }
        }

        if (obs.x + obs.width < 0) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      // Coins Logic
      for (let i = coinsRef.current.length - 1; i >= 0; i--) {
        const coin = coinsRef.current[i];
        
        if (p.magnetTimer > 0) {
          const dx = (p.x + p.width/2) - (coin.x + coin.width/2);
          const dy = (p.y + p.height/2) - (coin.y + coin.height/2);
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 300) { 
             coin.x += (dx / dist) * 15;
             coin.y += (dy / dist) * 15;
          } else {
             coin.x -= currentSpeed;
          }
        } else {
          coin.x -= currentSpeed;
          coin.y += Math.sin(frameCountRef.current * 0.1 + coin.wobbleOffset) * 0.5;
        }

        if (checkCollision(p, coin)) {
          coinsCollectedRef.current += (p.feverTimer > 0 ? 2 : 1); 
          createParticles(coin.x, coin.y, COLORS.coin, 5);
          coinsRef.current.splice(i, 1);
        } else if (coin.x + coin.width < -50) {
          coinsRef.current.splice(i, 1);
        }
      }

      // PowerUps Logic
      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        const pu = powerUpsRef.current[i];
        pu.x -= currentSpeed;
        pu.y += Math.sin(frameCountRef.current * 0.1 + pu.wobbleOffset) * 1;

        if (checkCollision(p, pu)) {
           if (pu.type === PowerUpType.SHIELD) {
              p.hasShield = true;
              createParticles(p.x, p.y, COLORS.buffShield, 20);
           } else if (pu.type === PowerUpType.MAGNET) {
              p.magnetTimer = 600; 
              createParticles(p.x, p.y, COLORS.buffMagnet, 20);
           } else if (pu.type === PowerUpType.FEVER) {
              p.feverTimer = 300; 
              createParticles(p.x, p.y, COLORS.buffFever, 40);
           }
           powerUpsRef.current.splice(i, 1);
        } else if (pu.x + pu.width < -50) {
          powerUpsRef.current.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const part = particlesRef.current[i];
        part.x += part.vx;
        part.y += part.vy;
        part.life -= 0.05;
        part.vy += 0.2; 
        if (part.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }
      
      // BG Parallax
      bgOffsetRef.current = (bgOffsetRef.current + currentSpeed * 0.2) % CANVAS_WIDTH;
    }

    // --- DRAWING ---

    // 1. Sky
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Background (Rice Field)
    const drawBackground = () => {
      if (imagesRef.current.bg && imagesRef.current.bg.complete && imagesRef.current.bg.naturalWidth > 0) {
          const bgImg = imagesRef.current.bg;
          let x = -bgOffsetRef.current;
          try {
              while (x < CANVAS_WIDTH) {
                  ctx.drawImage(bgImg, x, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                  x += CANVAS_WIDTH;
              }
              return;
          } catch (e) {
              // fall through to fallback
          }
      }
      
      // Fallback BG
      ctx.fillStyle = '#C8E6C9'; 
      ctx.fillRect(0, 200, CANVAS_WIDTH, 250);
      ctx.fillStyle = '#81C784';
      for(let i=0; i<3; i++) {
          let x = (i * 400) - (bgOffsetRef.current * 0.5) % 400;
          ctx.beginPath();
          ctx.arc(x, 380, 150, 0, Math.PI, true);
          ctx.fill();
      }
    };
    drawBackground();

    // 3. Ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    ctx.fillStyle = COLORS.groundDark;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 5); // Ground line

    // --- DRAW HELPER ---
    const drawSprite = (
      img: HTMLImageElement | undefined, 
      x: number, 
      y: number, 
      w: number, 
      h: number, 
      fallbackColor: string,
      rotation: number = 0
    ) => {
      let drawn = false;
      if (img && img.complete && img.naturalWidth > 0) {
        try {
          if (rotation !== 0) {
            ctx.save();
            ctx.translate(x + w/2, y + h/2);
            ctx.rotate(rotation);
            ctx.drawImage(img, -w/2, -h/2, w, h);
            ctx.restore();
          } else {
            ctx.drawImage(img, x, y, w, h);
          }
          drawn = true;
        } catch (e) {
          // Ignore error, fallback to rect
        }
      } 
      
      if (!drawn) {
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x, y, w, h);
      }
    };

    // 4. WATER DITCHES (Must draw below ground level visual, or over ground)
    obstaclesRef.current.forEach(obs => {
        if (obs.type === ObstacleType.WATER_DITCH) {
           const obsImg = imagesRef.current.obstacles[ObstacleType.WATER_DITCH][0];
           let drawn = false;
           
           if (obsImg && obsImg.complete && obsImg.naturalWidth > 0) {
               try {
                  ctx.drawImage(obsImg, obs.x, obs.y, obs.width, obs.height);
                  drawn = true;
               } catch (e) {
                  // Ignore
               }
           } 
           
           if (!drawn) {
               ctx.fillStyle = COLORS.waterDitch;
               ctx.fillRect(obs.x, GROUND_Y, obs.width, 20);
           }
        }
    });

    // 5. OBSTACLES (Above Ground)
    obstaclesRef.current.forEach(obs => {
       if (obs.type === ObstacleType.WATER_DITCH) return; // Already drawn

       let obsImg: HTMLImageElement | undefined;
       let color = COLORS.haystack;

       if (obs.type === ObstacleType.BIRD) {
          obsImg = imagesRef.current.obstacles[ObstacleType.BIRD][obs.frame];
          color = COLORS.bird;
       } else if (obs.type === ObstacleType.BUFFALO) {
          obsImg = imagesRef.current.obstacles[ObstacleType.BUFFALO][obs.frame];
          color = COLORS.buffalo;
       } else {
          obsImg = imagesRef.current.obstacles[obs.type][0];
          if (obs.type === ObstacleType.HAYSTACK) color = COLORS.haystack;
          if (obs.type === ObstacleType.ELECTRIC_POLE) color = COLORS.electricPole;
          if (obs.type === ObstacleType.TRICYCLE) color = COLORS.tricycle;
       }

       // Helper: Draw electric wires for pole fallback
       if (!obsImg && obs.type === ObstacleType.ELECTRIC_POLE) {
           ctx.strokeStyle = '#555';
           ctx.beginPath();
           ctx.moveTo(obs.x + 10, obs.y + 10);
           ctx.lineTo(obs.x - 50, obs.y + 20); // Wire to left
           ctx.stroke();
       }

       drawSprite(obsImg, obs.x, obs.y, obs.width, obs.height, color);
    });

    // 6. DOG (Big)
    const d = dogRef.current;
    const dogImg = imagesRef.current.dogRun[d.frame];
    drawSprite(dogImg, d.x, d.y, d.width, d.height, d.color);

    // 7. PLAYER (Big)
    const p = playerRef.current;
    let playerImg: HTMLImageElement | undefined;
    if (p.isGrounded) {
      playerImg = imagesRef.current.playerRun[p.runFrame];
    } else {
      playerImg = imagesRef.current.playerJump[p.jumpFrame];
    }
    
    // Squash & Stretch
    let drawW = p.width;
    let drawH = p.height;
    if (p.isJumping) { drawW *= 0.8; drawH *= 1.1; }
    if (p.isGrounded && Math.abs(p.vy) > 1) { drawW *= 1.2; drawH *= 0.8; }
    
    // Effect: Fever
    if (p.feverTimer > 0) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 15;
      ctx.shadowColor = `hsl(${frameCountRef.current * 10}, 100%, 50%)`;
    }
    
    // Invincible Blink
    if (p.invincibleTimer > 0 && p.feverTimer <= 0 && Math.floor(frameCountRef.current / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    drawSprite(
      playerImg, 
      p.x + (p.width - drawW)/2, 
      p.y + (p.height - drawH), 
      drawW, 
      drawH, 
      p.feverTimer > 0 ? `hsl(${frameCountRef.current * 10}, 100%, 50%)` : p.color
    );
    
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

    // Shield
    if (p.hasShield) {
       ctx.strokeStyle = COLORS.playerShield;
       ctx.lineWidth = 4;
       ctx.beginPath();
       ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width * 0.7, 0, Math.PI*2);
       ctx.stroke();
       ctx.fillStyle = 'rgba(33, 150, 243, 0.2)';
       ctx.fill();
    }
    
    // Magnet Icon
    if (p.magnetTimer > 0) {
       const magnetImg = imagesRef.current.items.magnet[0];
       drawSprite(magnetImg, p.x, p.y - 30, 30, 30, COLORS.buffMagnet);
    }

    // 8. POWER UPS
    powerUpsRef.current.forEach(pu => {
       let color = COLORS.buffShield;
       let img: HTMLImageElement | undefined;

       if (pu.type === PowerUpType.SHIELD) {
          color = COLORS.buffShield;
          img = imagesRef.current.items.shield[0];
       } else if (pu.type === PowerUpType.MAGNET) {
          color = COLORS.buffMagnet;
          img = imagesRef.current.items.magnet[0];
       } else if (pu.type === PowerUpType.FEVER) {
          color = COLORS.buffFever;
          img = imagesRef.current.items.fever[0];
       }

       const wobbleY = Math.sin(frameCountRef.current * 0.1 + pu.wobbleOffset) * 2;
       drawSprite(img, pu.x, pu.y + wobbleY, pu.width, pu.height, color);
    });

    // 9. COINS
    coinsRef.current.forEach(coin => {
      const coinImg = imagesRef.current.items.coin[0];
      const scaleX = Math.abs(Math.sin(frameCountRef.current * 0.1 + coin.wobbleOffset));
      
      let drawn = false;
      if (coinImg && coinImg.complete && coinImg.naturalWidth > 0) {
         try {
            const w = coin.width * scaleX;
            ctx.drawImage(coinImg, coin.x + (coin.width - w)/2, coin.y, w, coin.height);
            drawn = true;
         } catch(e) {
            // Ignore error
         }
      } 
      
      if (!drawn) {
         ctx.fillStyle = COLORS.coin;
         ctx.beginPath();
         ctx.ellipse(coin.x + coin.width/2, coin.y + coin.height/2, (coin.width/2) * scaleX, coin.height/2, 0, 0, Math.PI * 2);
         ctx.fill();
      }
    });

    // 10. PARTICLES
    particlesRef.current.forEach(part => {
      ctx.globalAlpha = part.life;
      ctx.fillStyle = part.color;
      ctx.fillRect(part.x, part.y, part.width, part.height);
      ctx.globalAlpha = 1.0;
    });

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, setGameState, updateStats, triggerShake, onGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleInput);
    window.addEventListener('touchstart', handleInput);
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('touchstart', handleInput);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [handleInput, loop]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      resetGame();
    }
    if (gameState === GameState.MENU) {
       resetGame();
    }
  }, [gameState, resetGame]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="absolute top-0 left-0 w-full h-full object-contain bg-sky-200"
    />
  );
};

export default GameCanvas;