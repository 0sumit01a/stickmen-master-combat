import type { Enemy } from '../types/game';

export interface GameUIState {
  goodKeys: number;
  missKeys: number;
  accuracy: number;
  wpm: number;
  combo: number;
  maxCombo: number;
  elapsedTime: string;
  score: number;
  progress: number;
  activeCard: 'TAB' | '1' | '2' | '3' | '4' | null;
  currentWeapon: string;
  currentAttack: string;
  practiceText: string;
  currentIndex: number;
  isCompleted?: boolean;
  troubleKeys?: string[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
  type: 'blood' | 'spark' | 'smoke' | 'flame' | 'dust';
  angle?: number;
  length?: number;
}

// Weather Particle for atmospheric wind drifts
interface WeatherLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const WEAPONS = ['Sword', 'Hammer', 'Katana', 'Spear', 'Axe', 'Dual Sword', 'Knife', 'Bare Hands'];

interface WeaponCombo {
  name: string;
  combos: string[];
  finisher: string;
}

export interface StickmanPose {
  hx: number;
  hy: number;
  nx: number;
  ny: number;
  hpx: number;
  hpy: number;
  hand1X: number;
  hand1Y: number;
  hand2X: number;
  hand2Y: number;
  foot1X: number;
  foot1Y: number;
  foot2X: number;
  foot2Y: number;
}

const WEAPON_COMBOS: Record<string, WeaponCombo> = {
  'Sword': {
    name: 'Sword',
    combos: ['Attack1', 'Attack2', 'Attack3', 'Attack4', 'Attack5'],
    finisher: 'Finisher'
  },
  'Hammer': {
    name: 'Hammer',
    combos: ['Swing1', 'Swing2', 'Overhead Smash', 'Ground Slam'],
    finisher: 'Finisher'
  },
  'Katana': {
    name: 'Katana',
    combos: ['Quick Draw', 'Slash Down', 'Slash Up', 'Side Sweep'],
    finisher: 'Finisher'
  },
  'Spear': {
    name: 'Spear',
    combos: ['Thrust', 'Sweeping Strike', 'Spin Shield', 'Overhead Pierce'],
    finisher: 'Finisher'
  },
  'Axe': {
    name: 'Axe',
    combos: ['Cleave', 'Hack', 'Spin Chop', 'Heavy Swing'],
    finisher: 'Finisher'
  },
  'Dual Sword': {
    name: 'Dual Sword',
    combos: ['X-Slash', 'Double Thrust', 'Spin Slice', 'Furry Slash'],
    finisher: 'Finisher'
  },
  'Knife': {
    name: 'Knife',
    combos: ['Quick stab', 'Reverse grip stab', 'Horizontal slash', 'Diagonal slash', 'Overhead slash', 'Low sweep slash', 'Spin slash', 'Lunging stab', 'Jumping slash'],
    finisher: 'Finisher slash'
  },
  'Bare Hands': {
    name: 'Bare Hands',
    combos: ['Jab', 'Cross', 'Hook', 'Uppercut', 'Elbow Strike', 'Palm Strike', 'Back Fist', 'Hammer Fist', 'Roundhouse Kick', 'Front Kick', 'Side Kick', 'Flying Knee', 'Jump Kick', 'Spinning Kick'],
    finisher: 'Finisher'
  }
};


// Web Audio API Synthesizer (No downloads, zero-asset game sound effects)
class SoundSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Correct keystroke mechanical click
  public playClick(pitch: number = 800) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch + Math.random() * 80, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch (e) {}
  }

  // Error buzzer on miss
  public playMiss() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Heavy hammer impact
  public playHammer() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.38);

      gain.gain.setValueAtTime(0.38, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // Laser sword swing
  public playLaser() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  // Machine gun fire click-pop
  public playMachineGun() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110 + Math.random() * 60, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  // General melee punch/kick slash noise
  public playSlash() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const bufferSize = this.ctx.sampleRate * 0.12; 
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.12);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.13);
    } catch (e) {}
  }
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private enemies: Enemy[] = [];
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private playerX: number = 0;
  private groundY: number = 0;

  // Typing Practice State
  private practiceText: string;
  private currentIndex: number = 0;

  // HUD and Stats State
  private startTime: number = 0;
  private goodKeys: number = 0;
  private missKeys: number = 0;
  private score: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private currentWeaponIndex: number = 0;
  private onStateChange: (state: GameUIState) => void;

  // Animation States
  private playerState: 'IDLE' | 'JUMPING' | 'ATTACK' | 'FINISHER' | 'MISS' = 'IDLE';
  private playerAnimTime: number = 0;
  private playerAnimDuration: number = 0.45; 
  private activeAnimation: string = 'IDLE';
  private currentWordStartIndex: number = -1;

  // Pose blending variables
  private blendStartPose: StickmanPose | null = null;
  private blendTimer: number = 0;
  private blendDuration: number = 0.16; // 160ms transition blend duration

  // Combo buffering queue and sequential progression variables
  private comboQueue: Array<{ anim: string; state: 'ATTACK' | 'FINISHER'; duration: number }> = [];
  private comboBufferTime: number = 0.20; // 200ms transition cancel buffer window
  private currentComboStep: number = 0;

  private enemyState: 'IDLE' | 'HEAD_HIT' | 'BODY_HIT' | 'STAGGER' | 'BLOCK' | 'KNOCKBACK' | 'HEAVY_STAGGER' = 'IDLE';
  private lastEnemyState: string = 'IDLE';
  private enemyAnimTime: number = 0;
  private enemyAnimDuration: number = 0.45;

  private activeCard: 'TAB' | '1' | '2' | '3' | '4' | null = null;
  private activeCardTimer: number = 0;

  // Game Feel Systems
  private particles: Particle[] = [];
  private weatherLeaves: WeatherLeaf[] = []; // Falling cherry/forest leaves
  private shakeIntensity: number = 0;
  private hitLanded: boolean = false;
  private flashFrames: number = 0;
  private lastHitX: number = 0;
  private lastHitY: number = 0;
  private hitStopTimer: number = 0; 
  private synth = new SoundSynth(); // Web audio synth instance
  private isCompleted: boolean = false;
  private missedKeysCount: Record<string, number> = {};

  constructor(
    canvas: HTMLCanvasElement, 
    practiceText: string, 
    onStateChange: (state: GameUIState) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.practiceText = practiceText;
    this.onStateChange = onStateChange;
    
    this.resize();
    this.spawnDummy();
    this.initWeather();
    
    window.addEventListener('keydown', this.handleKeyDown);
  }

  // Initialize weather leaves floating across space
  private initWeather() {
    this.weatherLeaves = [];
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    for (let i = 0; i < 30; i++) {
      this.weatherLeaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 15 + Math.random() * 25, // Drifts right
        vy: 20 + Math.random() * 30, // Drifts down
        size: 3 + Math.random() * 5,
        color: Math.random() < 0.45 
          ? 'rgba(52, 211, 153, 0.25)' // Forest Green Leaf
          : 'rgba(244, 63, 94, 0.25)', // Blossom Pink Petal
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0.5 + Math.random() * 1.5
      });
    }
  }

  private spawnDummy() {
    const newEnemy: Enemy = {
      id: 'dummy',
      side: 'right',
      position: { x: this.playerX + 220, y: this.groundY },
      speed: 0,
      width: 40,
      height: 96,
      color: '#ec4899', 
      word: '',
      typedLength: 0
    };
    this.enemies = [newEnemy];
  }

  public resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.parentElement?.clientWidth || 800;
    const height = this.canvas.parentElement?.clientHeight || 500;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.playerX = width / 2 - 120;
    this.groundY = height - 120;

    const dummy = this.enemies.find((e) => e.id === 'dummy');
    if (dummy) {
      dummy.position.x = this.playerX + 220;
      dummy.position.y = this.groundY;
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = performance.now();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
    this.dispatchState();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    let deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= deltaTime;
      deltaTime *= 0.08; 
    }

    this.update(deltaTime);
    this.draw(timestamp);

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number) {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    // 1. Update active card highlights
    if (this.activeCard) {
      this.activeCardTimer -= deltaTime;
      if (this.activeCardTimer <= 0) {
        this.activeCard = null;
        this.dispatchState();
      }
    }

    // 2. Update screen shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity *= Math.exp(-12 * deltaTime);
      if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
    }

    // Update blend timer
    if (this.blendTimer > 0) {
      this.blendTimer -= deltaTime;
      if (this.blendTimer < 0) this.blendTimer = 0;
    }

    // 3. Update player animation
    if (this.playerState !== 'IDLE') {
      this.playerAnimTime += deltaTime;
      const isAttack = this.playerState === 'ATTACK' || this.playerState === 'FINISHER';
      const pt = this.playerAnimTime / this.playerAnimDuration;
      
      const hitThreshold = this.playerState === 'FINISHER' ? 0.55 : 0.40;
      if (isAttack && pt >= hitThreshold && !this.hitLanded) {
        this.triggerHitImpact();
      }

      // Combo transition cancel window (DMC-style buffering)
      const remainingTime = this.playerAnimDuration - this.playerAnimTime;
      if (isAttack && this.comboQueue.length > 0 && remainingTime <= this.comboBufferTime) {
        const nextAttack = this.comboQueue.shift();
        if (nextAttack) {
          // Capture current pose for blending
          const currentPose = this.calculatePlayerPose(performance.now(), this.playerState, this.playerAnimTime, this.playerAnimDuration, this.activeAnimation);
          this.blendStartPose = currentPose;
          this.blendTimer = this.blendDuration;

          this.activeAnimation = nextAttack.anim;
          this.playerState = nextAttack.state;
          this.playerAnimDuration = nextAttack.duration;
          this.playerAnimTime = 0;
          this.hitLanded = false;

          this.spawnDustCloud(this.playerX, this.groundY, 10);
        }
      } else if (this.playerAnimTime >= this.playerAnimDuration) {
        this.playerState = 'IDLE';
        this.activeAnimation = 'IDLE';
        this.playerAnimTime = 0;
      }
    }

    // Pop next attack from queue if idle (keeps continuous fighting flow)
    if (this.playerState === 'IDLE' && this.comboQueue.length > 0) {
      const nextAttack = this.comboQueue.shift();
      if (nextAttack) {
        const currentPose = this.calculatePlayerPose(performance.now(), this.playerState, this.playerAnimTime, this.playerAnimDuration, this.activeAnimation);
        this.blendStartPose = currentPose;
        this.blendTimer = this.blendDuration;

        this.activeAnimation = nextAttack.anim;
        this.playerState = nextAttack.state;
        this.playerAnimDuration = nextAttack.duration;
        this.playerAnimTime = 0;
        this.hitLanded = false;

        this.spawnDustCloud(this.playerX, this.groundY, 10);
      }
    }

    // 4. Update enemy animation
    if (this.enemyState !== 'IDLE') {
      this.enemyAnimTime += deltaTime;
      if (this.enemyAnimTime >= this.enemyAnimDuration) {
        this.enemyState = 'IDLE';
        this.enemyAnimTime = 0;
      }
    }

    // Slide dummy back home
    const dummy = this.enemies.find((e) => e.id === 'dummy');
    if (dummy && this.enemyState === 'IDLE') {
      const homeX = this.playerX + 220;
      if (dummy.position.x > homeX) {
        dummy.position.x -= 150 * deltaTime; 
        if (dummy.position.x < homeX) dummy.position.x = homeX;
      } else if (dummy.position.x < homeX) {
        dummy.position.x += 150 * deltaTime;
        if (dummy.position.x > homeX) dummy.position.x = homeX;
      }
    }

    // 5. Spawn combo flames
    if (this.combo >= 10) {
      const color = this.combo >= 25 ? '#a855f7' : '#f97316'; 
      const spawnChance = this.combo >= 25 ? 0.45 : 0.25;
      if (Math.random() < spawnChance) {
        this.particles.push({
          x: this.playerX + (Math.random() - 0.5) * 40,
          y: this.groundY - Math.random() * 80,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.2 - Math.random() * 1.5,
          color,
          alpha: 0.8,
          size: 2.0 + Math.random() * 3.5,
          life: 0.4 + Math.random() * 0.4,
          maxLife: 0.8,
          type: 'flame'
        });
      }
    }

    // 6. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.type === 'flame') {
        p.vy -= 4.0 * deltaTime;
        p.x += p.vx;
        p.y += p.vy;
      } else if (p.type === 'dust') {
        p.vx *= 0.94;
        p.vy -= 0.5 * deltaTime;
        p.size += 22 * deltaTime;
        p.x += p.vx;
        p.y += p.vy;
      } else if (p.type === 'smoke') {
        p.vx *= 0.92;
        p.vy -= 1.0 * deltaTime;
        p.size += 36 * deltaTime;
        p.x += p.vx;
        p.y += p.vy;
      } else { 
        p.vy += 22 * deltaTime;
        p.x += p.vx;
        p.y += p.vy;
      }

      p.life -= deltaTime;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }


    // 7. Update atmospheric weather leaves (Wind speeds up with combo levels!)
    const windSpeedFactor = 45 + this.combo * 5; 
    for (const leaf of this.weatherLeaves) {
      leaf.x += (leaf.vx + windSpeedFactor) * deltaTime;
      leaf.y += leaf.vy * deltaTime;
      leaf.rotation += leaf.rotationSpeed * deltaTime;

      // Recycle leaf back to left border once it drifts out
      if (leaf.x > width + 20 || leaf.y > height + 20) {
        leaf.x = -20;
        leaf.y = Math.random() * height;
      }
    }

    // 8. Flash frames
    if (this.flashFrames > 0) {
      this.flashFrames--;
    }

    // 9. Periodically dispatch state
    if (Math.random() < 0.02) {
      this.dispatchState();
    }
  }

  private triggerCombatHit(isGood: boolean, isFinisher: boolean = false, testingCard: 'TAB' | '1' | '2' | '3' | '4' | null = null) {
    if (isGood) {
      this.goodKeys++;
      this.combo++;
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }
      
      const multiplier = Math.min(4, Math.floor(this.combo / 10) + 1);
      this.score += 100 * multiplier;

      // Select animation
      const activeWeapon = WEAPONS[this.currentWeaponIndex];
      const comboTree = WEAPON_COMBOS[activeWeapon] || WEAPON_COMBOS['Sword'];

      let selectedAnim = '';
      let targetState: 'ATTACK' | 'FINISHER' = 'ATTACK';
      let targetDuration = 0.55;

      if (isFinisher) {
        selectedAnim = comboTree.finisher;
        targetState = 'FINISHER';
        targetDuration = 1.1; // Longer, heavier finisher animation
        this.currentComboStep = 0; // Reset steps for next word
      } else if (testingCard) {
        const cards: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, 'TAB': 4 };
        const idx = cards[testingCard] ?? 0;
        if (idx < comboTree.combos.length) {
          selectedAnim = comboTree.combos[idx];
          targetState = 'ATTACK';
          targetDuration = 0.55;
        } else {
          selectedAnim = comboTree.finisher;
          targetState = 'FINISHER';
          targetDuration = 1.1;
          this.currentComboStep = 0;
        }
      } else {
        this.currentComboStep++;
        const comboIdx = (this.currentComboStep - 1) % comboTree.combos.length;
        selectedAnim = comboTree.combos[comboIdx];
        targetState = 'ATTACK';
        targetDuration = 0.55;
      }

      const activeCard = testingCard || (['1', '2', '3', '4', 'TAB'] as const)[this.goodKeys % 5];
      this.activeCard = activeCard;
      this.activeCardTimer = 0.2;

      // If an attack or finisher is already playing, push to combo queue
      const isAlreadyPlaying = this.playerState === 'ATTACK' || this.playerState === 'FINISHER';
      if (isAlreadyPlaying) {
        this.comboQueue.push({
          anim: selectedAnim,
          state: targetState,
          duration: targetDuration
        });
      } else {
        // Capture current pose for blending
        const currentPose = this.calculatePlayerPose(performance.now(), this.playerState, this.playerAnimTime, this.playerAnimDuration, this.activeAnimation);
        this.blendStartPose = currentPose;
        this.blendTimer = this.blendDuration;

        this.activeAnimation = selectedAnim;
        this.playerState = targetState;
        this.playerAnimDuration = targetDuration;
        this.playerAnimTime = 0;
        this.hitLanded = false;

        this.spawnDustCloud(this.playerX, this.groundY, 10);
      }
    } else {
      // Clear queue and step counter on miss
      this.comboQueue = [];
      this.currentComboStep = 0;

      // Capture current pose for blending
      const currentPose = this.calculatePlayerPose(performance.now(), this.playerState, this.playerAnimTime, this.playerAnimDuration, this.activeAnimation);
      this.blendStartPose = currentPose;
      this.blendTimer = this.blendDuration;

      this.missKeys++;
      this.combo = 0;
      this.playerState = 'MISS';
      this.activeAnimation = 'MISS';
      this.playerAnimTime = 0;
      this.playerAnimDuration = 0.45;
      
      this.spawnParticles(this.playerX + 50, this.groundY - 60, '#475569', 8, 'dust');
      this.shakeIntensity = 5;

      // Play miss sound
      this.synth.playMiss();
    }

    this.dispatchState();
  }

  private triggerHitImpact() {
    this.hitLanded = true;
    const dummy = this.enemies.find((e) => e.id === 'dummy');
    if (!dummy) return;

    this.lastHitX = dummy.position.x - 10;
    this.lastHitY = this.groundY - 70;
    this.flashFrames = 5; 

    const isFinisher = this.playerState === 'FINISHER';
    this.hitStopTimer = isFinisher ? 0.24 : 0.08; 

    const reactions: ('HEAD_HIT' | 'BODY_HIT' | 'STAGGER' | 'BLOCK' | 'KNOCKBACK' | 'HEAVY_STAGGER')[] = [
      'HEAD_HIT', 'BODY_HIT', 'STAGGER', 'BLOCK', 'HEAVY_STAGGER'
    ];
    
    if (isFinisher) {
      this.enemyState = 'KNOCKBACK';
    } else {
      const candidates = reactions.filter(r => r !== this.lastEnemyState);
      this.enemyState = candidates[Math.floor(Math.random() * candidates.length)];
    }
    this.lastEnemyState = this.enemyState;
    
    this.enemyAnimTime = 0;
    this.enemyAnimDuration = this.enemyState === 'KNOCKBACK' ? 0.80 : 0.45;

    const smokeCount = isFinisher ? 35 : 12;
    this.spawnParticles(this.lastHitX, this.lastHitY, 'rgba(100, 102, 105, 0.55)', smokeCount, 'smoke');

    const sparkCount = isFinisher ? 40 : 15;
    this.spawnParticles(this.lastHitX, this.lastHitY, '#f59e0b', sparkCount, 'spark');

    const activeWeapon = WEAPONS[this.currentWeaponIndex];
    if (activeWeapon === 'Knife') {
      this.shakeIntensity = isFinisher ? 35 : 12;
      this.spawnParticles(this.lastHitX, this.lastHitY, '#ffffff', isFinisher ? 25 : 12, 'spark');
      this.spawnParticles(this.lastHitX, this.lastHitY, '#ef4444', isFinisher ? 30 : 15, 'blood');
      this.synth.playSlash();
    } else if (this.enemyState === 'BLOCK') {
      this.shakeIntensity = 6;
      this.spawnParticles(this.lastHitX, this.lastHitY, '#06b6d4', 15, 'spark');
      
      this.synth.playSlash();
    } else if (activeWeapon === 'Hammer') {
      this.shakeIntensity = isFinisher ? 36 : 18; 
      this.spawnParticles(this.lastHitX, this.lastHitY + 25, '#ef4444', isFinisher ? 35 : 20, 'blood');
      this.spawnParticles(this.lastHitX, this.lastHitY + 25, '#78350f', isFinisher ? 25 : 15, 'dust'); 

      // Synthesize hammer thud
      this.synth.playHammer();
    } else {
      this.shakeIntensity = isFinisher ? 30 : 9;
      this.spawnParticles(this.lastHitX, this.lastHitY, '#ef4444', isFinisher ? 35 : 15, 'blood');

      // Synthesize swing sounds
      const isLaser = activeWeapon === 'Sword' || activeWeapon === 'Katana' || activeWeapon === 'Dual Sword';
      if (isLaser) {
        this.synth.playLaser();
      } else {
        this.synth.playSlash();
      }
    }

    if (isFinisher) {
      dummy.position.x += 160; 
    } else {
      dummy.position.x += 20; 
    }
  }

  private spawnDustCloud(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const vx = -2.0 - Math.random() * 3.0; 
      const vy = -0.5 - Math.random() * 1.5;
      const maxLife = 0.5 + Math.random() * 0.4;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 10,
        vx,
        vy,
        color: 'rgba(230, 232, 235, 0.4)', 
        alpha: 0.5,
        size: 5 + Math.random() * 8,
        life: maxLife,
        maxLife,
        type: 'dust'
      });
    }
  }

  private spawnParticles(x: number, y: number, color: string, count: number, type: 'blood' | 'spark' | 'smoke' | 'flame' | 'dust') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * 0.8 - 0.4) * Math.PI - (Math.random() < 0.5 ? Math.PI : 0);
      const speed = type === 'spark' ? 4.5 + Math.random() * 6.5 : 2.0 + Math.random() * 5.0;
      const maxLife = type === 'smoke' ? (0.6 + Math.random() * 0.4) : (0.4 + Math.random() * 0.3);
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2.0,
        vy: Math.sin(angle) * speed - 2.0,
        color,
        alpha: 1,
        size: type === 'smoke' ? (8 + Math.random() * 10) : (2.5 + Math.random() * 4.0),
        life: maxLife,
        maxLife,
        type
      });
    }
  }



  private isWordEnd(index: number): boolean {
    if (index < 0 || index >= this.practiceText.length) return false;
    const char = this.practiceText[index];
    if (char === ' ' || char === '\n') return false;
    if (index === this.practiceText.length - 1) return true;
    const nextChar = this.practiceText[index + 1];
    return nextChar === ' ' || nextChar === '\n';
  }

  private getCurrentWordBounds(index: number) {
    if (index < 0 || index >= this.practiceText.length) return null;
    const char = this.practiceText[index];
    if (char === ' ' || char === '\n') return null;
    
    let start = index;
    while (start > 0 && this.practiceText[start - 1] !== ' ' && this.practiceText[start - 1] !== '\n') {
      start--;
    }
    let end = index;
    while (end < this.practiceText.length && this.practiceText[end] !== ' ' && this.practiceText[end] !== '\n') {
      end++;
    }
    return { start, end };
  }

  private updateWeaponForCurrentIndex() {
    if (this.currentIndex >= this.practiceText.length) return;

    const bounds = this.getCurrentWordBounds(this.currentIndex);
    if (bounds) {
      if (this.currentWordStartIndex !== bounds.start) {
        this.currentWordStartIndex = bounds.start;
        if (bounds.start > 0) {
          this.currentWeaponIndex = (this.currentWeaponIndex + 1) % WEAPONS.length;
        } else {
          this.currentWeaponIndex = 0;
        }
      }
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.isRunning) return;
    if (this.isCompleted) return;

    const keyStr = e.key.toUpperCase();
    const expectedChar = this.practiceText[this.currentIndex];

    if (keyStr === 'TAB' || keyStr === '1' || keyStr === '2' || keyStr === '3' || keyStr === '4' || keyStr === ' ') {
      if (keyStr === ' ' && expectedChar === ' ') {
        // Fall through
      } else {
        e.preventDefault();
        if (keyStr === ' ') {
          this.playerState = 'JUMPING';
          this.playerAnimTime = 0;
          this.playerAnimDuration = 0.45;
        } else {
          const cardLabel = keyStr === 'TAB' ? 'TAB' : keyStr as '1' | '2' | '3' | '4';
          this.triggerCombatHit(true, false, cardLabel);
        }
        return;
      }
    }

    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key.length !== 1 && e.key !== 'Enter') return;

    let isMatch = false;
    if (expectedChar === '\n') {
      isMatch = e.key === 'Enter';
    } else {
      isMatch = e.key === expectedChar;
    }

    if (isMatch) {
      const isFinisher = this.isWordEnd(this.currentIndex);
      this.currentIndex++;
      this.updateWeaponForCurrentIndex();
      this.triggerCombatHit(true, isFinisher);

      // Play click sound scaled by character type
      this.synth.playClick(e.key.charCodeAt(0) * 2.5 + 400);

      if (this.currentIndex >= this.practiceText.length) {
        this.isCompleted = true;
        this.dispatchState();
      }
    } else {
      if (e.key.length === 1 || e.key === 'Enter') {
        const expected = expectedChar === '\n' ? 'Enter' : expectedChar === ' ' ? 'Space' : expectedChar;
        this.missedKeysCount[expected] = (this.missedKeysCount[expected] || 0) + 1;
        this.triggerCombatHit(false);
      }
    }
  };

  public resetSession() {
    this.currentIndex = 0;
    this.goodKeys = 0;
    this.missKeys = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.isCompleted = false;
    this.missedKeysCount = {};
    this.startTime = performance.now();
    this.lastTime = performance.now();
    this.playerState = 'IDLE';
    this.activeAnimation = 'IDLE';
    this.currentWordStartIndex = -1;
    this.blendStartPose = null;
    this.blendTimer = 0;
    this.comboQueue = [];
    this.currentComboStep = 0;
    this.enemyState = 'IDLE';
    this.lastEnemyState = 'IDLE';
    this.isRunning = true;
    
    this.updateWeaponForCurrentIndex();

    const dummy = this.enemies.find((e) => e.id === 'dummy');
    if (dummy) {
      dummy.position.x = this.playerX + 220;
    }
    this.dispatchState();
  }

  private getElapsedTimeStr(): string {
    const elapsedSeconds = Math.floor((performance.now() - this.startTime) / 1000);
    const min = Math.floor(elapsedSeconds / 60);
    const sec = elapsedSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  private dispatchState() {
    const totalKeys = this.goodKeys + this.missKeys;
    const accuracy = totalKeys === 0 ? 100 : Math.round((this.goodKeys / totalKeys) * 100);

    const minutes = (performance.now() - this.startTime) / 60000;
    const wpm = minutes < 0.05 ? 0 : Math.round((this.goodKeys / 5) / minutes);

    const textProgress = Math.round((this.currentIndex / this.practiceText.length) * 100);

    const sortedMissed = Object.entries(this.missedKeysCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([char]) => char);

    this.onStateChange({
      goodKeys: this.goodKeys,
      missKeys: this.missKeys,
      accuracy,
      wpm,
      combo: this.combo,
      maxCombo: this.maxCombo,
      elapsedTime: this.getElapsedTimeStr(),
      score: this.score,
      progress: textProgress,
      activeCard: this.activeCard,
      currentWeapon: WEAPONS[this.currentWeaponIndex],
      currentAttack: this.activeAnimation,
      practiceText: this.practiceText,
      currentIndex: this.currentIndex,
      isCompleted: this.isCompleted,
      troubleKeys: sortedMissed,
    });
  }

  private getPlayerOffsets(pState = this.playerState, pAnimTime = this.playerAnimTime, pAnimDuration = this.playerAnimDuration) {
    const rawT = pState === 'IDLE' ? 0 : pAnimTime / pAnimDuration;
    const pt = rawT;

    let dx = 0;
    let dy = 0;

    if (pState === 'JUMPING') {
      dy = Math.sin(pt * Math.PI) * 120;
    } else if (pState === 'MISS') {
      const angle = pt * Math.PI;
      dx = -18 * Math.sin(angle);
    } else if (pState === 'ATTACK') {
      const dummy = this.enemies.find((e) => e.id === 'dummy');
      const dummyX = dummy ? dummy.position.x : (this.playerX + 220);
      const targetLunge = Math.max(40, (dummyX - this.playerX - 60) * 0.65); // Shorter, weightier lunge step

      if (pt < 0.20) {
        // Phase 1: Winding anticipation back step
        const t = pt / 0.20;
        dx = -12 * this.easeInOutCubic(t);
        dy = 0;
      } else if (pt < 0.45) {
        // Phase 2: Leap step forward
        const t = (pt - 0.20) / 0.25;
        dx = -12 + this.easeInOutCubic(t) * (targetLunge + 12);
        dy = Math.sin(t * Math.PI) * 10;
      } else if (pt < 0.65) {
        // Phase 3: Recoil impact
        const t = (pt - 0.45) / 0.20;
        dx = targetLunge - this.easeInOutCubic(t) * 15;
        dy = 0;
      } else {
        // Phase 4: Recover home
        const t = (pt - 0.65) / 0.35;
        const startX = targetLunge - 15;
        dx = startX - this.easeInOutCubic(t) * startX;
        dy = 0;
      }
    } else if (pState === 'FINISHER') {
      const dummy = this.enemies.find((e) => e.id === 'dummy');
      const dummyX = dummy ? dummy.position.x : (this.playerX + 220);
      const targetLunge = Math.max(40, (dummyX - this.playerX - 60) * 0.65);

      if (pt < 0.30) {
        // Phase 1: Heavy anticipation
        const t = pt / 0.30;
        dx = -25 * this.easeInOutCubic(t);
        dy = -10 * this.easeInOutCubic(t);
      } else if (pt < 0.58) {
        // Phase 2: Explosive lunging jump
        const t = (pt - 0.30) / 0.28;
        dx = -25 + this.easeInOutCubic(t) * (targetLunge + 45);
        dy = -10 + this.easeInOutCubic(t) * 55;
      } else if (pt < 0.75) {
        // Phase 3: Land and recoil impact
        const t = (pt - 0.58) / 0.17;
        dx = (targetLunge + 20) - this.easeInOutCubic(t) * 35;
        dy = 45 - this.easeInOutCubic(t) * 45;
      } else {
        // Phase 4: Recovery home
        const t = (pt - 0.75) / 0.25;
        const startX = targetLunge - 15;
        dx = startX - this.easeInOutCubic(t) * startX;
        dy = 0;
      }
    }

    return { dx, dy };
  }

  private getEnemyOffsets(eState = this.enemyState, eAnimTime = this.enemyAnimTime, eAnimDuration = this.enemyAnimDuration) {
    const rawET = eState === 'IDLE' ? 0 : eAnimTime / eAnimDuration;
    const et = this.easeInOutCubic(rawET);
    const direction = -1; // Dummy is on the right, so direction relative to player is -1

    let dx = 0;
    let tilt = 0;
    let dy = 0;

    if (eState === 'HEAD_HIT') {
      tilt = 0.35 * Math.sin(et * Math.PI) * direction;
      dx = 18 * Math.sin(et * Math.PI) * direction;
    } else if (eState === 'BODY_HIT') {
      tilt = -0.25 * Math.sin(et * Math.PI) * direction;
      dx = 22 * Math.sin(et * Math.PI) * direction;
    } else if (eState === 'STAGGER') {
      tilt = 0.28 * Math.sin(et * Math.PI) * direction;
      dx = 45 * Math.sin(et * Math.PI) * direction;
      dy = 10 * Math.sin(et * Math.PI);
    } else if (eState === 'BLOCK') {
      tilt = -0.08 * Math.sin(et * Math.PI) * direction;
      dx = 10 * Math.sin(et * Math.PI) * direction;
    } else if (eState === 'HEAVY_STAGGER') {
      tilt = 0.45 * Math.sin(et * Math.PI) * direction;
      dx = 75 * Math.sin(et * Math.PI) * direction;
      dy = 18 * Math.sin(et * Math.PI);
    } else if (eState === 'KNOCKBACK') { 
      dx = 170 * Math.sin(et * Math.PI) * direction; 
      dy = -150 * Math.sin(et * Math.PI); 
      tilt = et * Math.PI * 2.0 * direction; 
    }

    return { dx, dy, tilt };
  }

  private drawShadows() {
    const ctx = this.ctx;
    ctx.save();
    const playerOffsets = this.getPlayerOffsets();
    const playerHeightFactor = Math.max(0, 1.0 - playerOffsets.dy / 150);
    ctx.shadowBlur = 15 * playerHeightFactor;
    ctx.shadowColor = '#06b6d4';
    ctx.fillStyle = `rgba(6, 182, 212, ${0.15 * playerHeightFactor})`;
    ctx.strokeStyle = `rgba(6, 182, 212, ${playerHeightFactor})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(this.playerX + playerOffsets.dx, this.groundY, 60 * playerHeightFactor, 14 * playerHeightFactor, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Draw Enemy Stature: Height-relative ground shadow under dummy
    ctx.save();
    const dummy = this.enemies.find((e) => e.id === 'dummy');
    const dummyX = dummy ? dummy.position.x : (this.playerX + 220);
    const enemyOffsets = this.getEnemyOffsets();
    
    const dummyHeightFactor = Math.max(0, 1.0 - Math.abs(enemyOffsets.dy) / 180);
    ctx.shadowBlur = 12 * dummyHeightFactor;
    ctx.shadowColor = '#ec4899'; 
    ctx.fillStyle = `rgba(236, 72, 153, ${0.15 * dummyHeightFactor})`;
    ctx.strokeStyle = `rgba(236, 72, 153, ${dummyHeightFactor})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(dummyX + enemyOffsets.dx, this.groundY, 55 * dummyHeightFactor, 12 * dummyHeightFactor, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private draw(timestamp: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    
    // Screen Shake
    if (this.shakeIntensity > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(dx, dy);
    }

    // Draw horizon line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(this.canvas.width, this.groundY);
    ctx.stroke();

    // Draw Shadows
    this.drawShadows();

    // Draw Stone Wall behind stickmen
    const wallX = this.playerX + 110;
    const wallY = this.groundY;
    
    ctx.fillStyle = '#b8bac2';
    ctx.strokeStyle = '#4e5058';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(wallX - 225, wallY);
    ctx.lineTo(wallX - 210, wallY - 65);
    ctx.lineTo(wallX - 140, wallY - 95);
    ctx.lineTo(wallX - 150, wallY - 180);
    ctx.lineTo(wallX - 85, wallY - 210);
    ctx.lineTo(wallX - 55, wallY - 185);
    ctx.lineTo(wallX - 40, wallY - 95);
    ctx.lineTo(wallX + 20, wallY - 125);
    ctx.lineTo(wallX + 40, wallY - 200);
    ctx.lineTo(wallX + 110, wallY - 215);
    ctx.lineTo(wallX + 170, wallY - 165);
    ctx.lineTo(wallX + 145, wallY - 80);
    ctx.lineTo(wallX + 225, wallY - 60);
    ctx.lineTo(wallX + 240, wallY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stone cracks
    ctx.strokeStyle = 'rgba(78, 80, 88, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wallX - 190, wallY - 50); ctx.lineTo(wallX + 200, wallY - 50);
    ctx.moveTo(wallX - 140, wallY - 100); ctx.lineTo(wallX + 150, wallY - 100);
    ctx.moveTo(wallX - 110, wallY - 150); ctx.lineTo(wallX + 115, wallY - 150);
    ctx.moveTo(wallX - 80, wallY); ctx.lineTo(wallX - 80, wallY - 50);
    ctx.moveTo(wallX + 80, wallY); ctx.lineTo(wallX + 80, wallY - 50);
    ctx.moveTo(wallX - 25, wallY - 50); ctx.lineTo(wallX - 25, wallY - 100);
    ctx.moveTo(wallX + 55, wallY - 50); ctx.lineTo(wallX + 55, wallY - 100);
    ctx.stroke();

    // Draw Player Stickman
    this.drawPlayer(timestamp);

    // Draw Enemies (Dummy)
    for (const enemy of this.enemies) {
      this.drawEnemy(enemy);
    }

    // Draw Atmospheric Weather Leaves
    for (const leaf of this.weatherLeaves) {
      ctx.save();
      ctx.fillStyle = leaf.color;
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.beginPath();
      // Draw tapered leaf / petal shape
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      
      if (p.type === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5; 
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.8, p.y - p.vy * 2.8);
        ctx.stroke();
      } else if (p.type === 'smoke' || p.type === 'dust') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'flame') {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1.0;

    // Draw Impact Slash Flash
    if (this.flashFrames > 0) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 25;
      ctx.lineWidth = 8; 
      ctx.beginPath();
      ctx.moveTo(this.lastHitX - 35, this.lastHitY - 20);
      ctx.lineTo(this.lastHitX + 35, this.lastHitY + 20);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private drawSegmentedLimb(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number, 
    x2: number, y2: number, 
    bendSide: 1 | -1, 
    lengthRatio: number = 0.5
  ) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const mx = x1 + dx * lengthRatio;
    const my = y1 + dy * lengthRatio;

    const px = -dy;
    const py = dx;
    const lenP = Math.sqrt(px * px + py * py);
    
    let bx = 0;
    let by = 0;
    if (lenP > 0) {
      const maxBend = 10;
      const bendScale = Math.max(0, 1.0 - dist / 75) * maxBend * bendSide;
      bx = (px / lenP) * bendScale;
      by = (py / lenP) * bendScale;
    }

    const jx = mx + bx;
    const jy = my + by;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(jx, jy);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(jx, jy, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private calculatePlayerPose(timestamp: number, pState: any, pAnimTime: number, pAnimDuration: number, actAnimation: string): StickmanPose {
    const x = this.playerX;
    const y = this.groundY;
    const weapon = WEAPONS[this.currentWeaponIndex];
    const rawT = pState === 'IDLE' ? 0 : pAnimTime / pAnimDuration;
    
    let pt = this.easeInOutCubic(rawT); 
    if (rawT >= 0.7) {
      const recoveryFactor = (rawT - 0.7) / 0.3;
      pt = 1.0 - (1.0 - pt) * Math.sin(recoveryFactor * Math.PI * 0.5); 
    }
    
    const breath = pState === 'IDLE' ? Math.sin(timestamp * 0.003) * 2.5 : 0; 

    // Retrieve offsets
    const offsets = this.getPlayerOffsets(pState, pAnimTime, pAnimDuration);
    const dx = offsets.dx;
    const dy = offsets.dy;

    // Torso tilts and crouches (weight shifts)
    let tilt = 0;
    let crouchOffset = 0;
    if (pState === 'ATTACK') {
      if (pt < 0.20) {
        tilt = -0.15 * Math.sin((pt / 0.20) * Math.PI / 2);
        crouchOffset = Math.sin((pt / 0.20) * Math.PI / 2) * 6;
      } else if (pt < 0.45) {
        tilt = 0.42 * Math.sin(((pt - 0.20) / 0.25) * Math.PI);
      } else {
        tilt = 0.42 * (1.0 - (pt - 0.45) / 0.55);
      }
    } else if (pState === 'FINISHER') {
      if (pt < 0.30) {
        tilt = -0.38 * Math.sin((pt / 0.30) * Math.PI / 2);
        crouchOffset = Math.sin((pt / 0.30) * Math.PI / 2) * 16;
      } else if (pt < 0.58) {
        tilt = 0.58 * Math.sin(((pt - 0.30) / 0.28) * Math.PI);
        crouchOffset = (1.0 - (pt - 0.30) / 0.28) * 16;
      } else {
        tilt = 0.25 * (1.0 - (pt - 0.58) / 0.42);
      }
    } else if (pState === 'MISS') {
      tilt = -0.25 * Math.sin(pt * Math.PI);
    }

    const hx = x + dx;
    const hy = y - 94 - dy + breath; 
    
    const nx = hx + tilt * 14;
    const ny = y - 80 - dy + breath; 
    const hpx = hx - tilt * 12;
    const hpy = y - 42 - dy + crouchOffset; 

    // Arms
    let hand1X = nx - 16;
    let hand1Y = ny + 24;
    let hand2X = nx + 10;
    let hand2Y = ny + 28;

    // Legs
    let foot1X = hpx - 18;
    let foot1Y = y;
    let foot2X = hpx + 18;
    let foot2Y = y;

    const animName = actAnimation;
    const isBareHands = weapon === 'Bare Hands';

    if (pState === 'IDLE') {
      if (isBareHands) {
        hand1X = nx + 10; hand1Y = ny + 12;
        hand2X = nx - 10; hand2Y = ny + 14;
      } else {
        hand1X = nx - 12; hand1Y = ny + 20;
        hand2X = nx + 12; hand2Y = ny + 24;
      }
    } else if (pState === 'JUMPING') {
      hand1X = nx - 10; hand1Y = ny - 10;
      hand2X = nx + 10; hand2Y = ny - 12;
      foot1X = hpx - 10; foot1Y = hpy + 20;
      foot2X = hpx + 10; foot2Y = hpy + 20;
    } else if (pState === 'MISS') {
      hand1X = nx + 5; hand1Y = ny + 32;
      hand2X = nx - 12; hand2Y = ny + 30;
      foot1X = hpx - 10; foot1Y = y;
      foot2X = hpx + 10; foot2Y = y;
    } else {
      const strikeProgress = Math.sin(pt * Math.PI);
      
      if (weapon === 'Sword') {
        if (animName === 'Attack1' || animName === 'Quick Draw') {
          const swingAngle = -Math.PI / 3 + pt * (Math.PI * 1.15);
          hand1X = nx + Math.cos(swingAngle) * 36;
          hand1Y = ny + Math.sin(swingAngle) * 36;
          hand2X = nx - 10; hand2Y = ny + 22;
        } else if (animName === 'Attack2' || animName === 'Slash Down' || animName === 'Cleave') {
          const swingAngle = -Math.PI * 0.8 + pt * (Math.PI * 1.25);
          hand1X = nx + Math.cos(swingAngle) * 34;
          hand1Y = ny + Math.sin(swingAngle) * 34;
          hand2X = hand1X - 5; hand2Y = hand1Y + 2;
        } else if (animName === 'Attack3' || animName === 'Slash Up' || animName === 'Hack') {
          const swingAngle = Math.PI * 0.5 - pt * (Math.PI * 1.1);
          hand1X = nx + Math.cos(swingAngle) * 32;
          hand1Y = ny + Math.sin(swingAngle) * 32;
          hand2X = nx - 10; hand2Y = ny + 20;
        } else if (animName === 'Attack4' || animName === 'Lunge stab' || animName === 'Thrust') {
          const extend = strikeProgress * 45;
          hand1X = nx + 14 + extend;
          hand1Y = ny + 6;
          hand2X = nx - 4; hand2Y = ny + 18;
        } else if (animName === 'Attack5' || animName === 'Spin slash' || animName === 'Spin Chop') {
          const swingAngle = -Math.PI * 0.5 + pt * Math.PI * 2.0;
          hand1X = nx + Math.cos(swingAngle) * 35;
          hand1Y = ny + Math.sin(swingAngle) * 20;
          hand2X = nx - 12; hand2Y = ny + 22;
        } else {
          // Finisher
          if (pt < 0.35) {
            hand1X = nx - 16; hand1Y = ny - 24;
          } else {
            const swingAngle = -Math.PI * 0.8 + (pt - 0.35)/0.65 * (Math.PI * 1.3);
            hand1X = nx + Math.cos(swingAngle) * 38;
            hand1Y = ny + Math.sin(swingAngle) * 38;
          }
          hand2X = hand1X - 4; hand2Y = hand1Y + 2;
        }
      } else if (weapon === 'Hammer') {
        if (animName === 'Swing1') {
          const swingAngle = -Math.PI * 0.75 + pt * Math.PI * 1.3;
          hand1X = nx + Math.cos(swingAngle) * 34;
          hand1Y = ny + Math.sin(swingAngle) * 34;
          hand2X = hand1X - 5; hand2Y = hand1Y + 2;
        } else if (animName === 'Swing2') {
          const swingAngle = Math.PI * 0.5 - pt * Math.PI * 1.1;
          hand1X = nx + Math.cos(swingAngle) * 30;
          hand1Y = ny + Math.sin(swingAngle) * 30;
          hand2X = hand1X - 5; hand2Y = hand1Y + 2;
        } else if (animName === 'Overhead Smash') {
          const swingAngle = -Math.PI * 0.85 + pt * Math.PI * 1.4;
          hand1X = nx + Math.cos(swingAngle) * 36;
          hand1Y = ny + Math.sin(swingAngle) * 36;
          hand2X = hand1X - 5; hand2Y = hand1Y + 3;
        } else if (animName === 'Ground Slam') {
          const t = Math.sin(pt * Math.PI);
          hand1X = nx + 12 + t * 24;
          hand1Y = ny + 12 + t * 35;
          hand2X = hand1X - 5; hand2Y = hand1Y + 3;
        } else {
          // Finisher
          if (pt < 0.35) {
            hand1X = nx - 22; hand1Y = ny - 28;
          } else {
            const swingAngle = -Math.PI * 0.9 + (pt - 0.35)/0.65 * (Math.PI * 1.45);
            hand1X = nx + Math.cos(swingAngle) * 38;
            hand1Y = ny + Math.sin(swingAngle) * 38;
          }
          hand2X = hand1X - 5; hand2Y = hand1Y + 2;
        }
      } else if (weapon === 'Katana') {
        if (animName === 'Quick Draw') {
          const swingAngle = -Math.PI * 0.15 + pt * (Math.PI * 0.75);
          hand1X = nx + Math.cos(swingAngle) * 38;
          hand1Y = ny + Math.sin(swingAngle) * 8;
          hand2X = nx - 12; hand2Y = ny + 16;
        } else if (animName === 'Slash Down') {
          const swingAngle = -Math.PI * 0.8 + pt * (Math.PI * 1.2);
          hand1X = nx + Math.cos(swingAngle) * 36;
          hand1Y = ny + Math.sin(swingAngle) * 36;
          hand2X = hand1X - 4; hand2Y = hand1Y + 2;
        } else if (animName === 'Slash Up') {
          const swingAngle = Math.PI * 0.6 - pt * (Math.PI * 1.15);
          hand1X = nx + Math.cos(swingAngle) * 34;
          hand1Y = ny + Math.sin(swingAngle) * 34;
          hand2X = nx - 10; hand2Y = ny + 20;
        } else if (animName === 'Side Sweep') {
          const swingAngle = -Math.PI / 4 + pt * (Math.PI * 0.9);
          hand1X = nx + Math.cos(swingAngle) * 36;
          hand1Y = ny + Math.sin(swingAngle) * 16;
          hand2X = nx - 12; hand2Y = ny + 22;
        } else {
          // Finisher
          const swingAngle = -Math.PI * 0.85 + pt * (Math.PI * 1.5);
          hand1X = nx + Math.cos(swingAngle) * 38;
          hand1Y = ny + Math.sin(swingAngle) * 38;
          hand2X = hand1X - 4; hand2Y = hand1Y + 2;
        }
      } else if (weapon === 'Spear') {
        if (animName === 'Thrust') {
          const thrustExtend = strikeProgress * 45;
          hand1X = nx + 14 + thrustExtend;
          hand1Y = ny + 6;
          hand2X = nx + 2 + thrustExtend;
          hand2Y = ny + 10;
        } else if (animName === 'Sweeping Strike') {
          const swingAngle = -Math.PI * 0.6 + pt * (Math.PI * 1.2);
          hand1X = nx + Math.cos(swingAngle) * 38;
          hand1Y = ny + Math.sin(swingAngle) * 24;
          hand2X = hand1X - 10; hand2Y = hand1Y + 4;
        } else if (animName === 'Spin Shield') {
          const angle = pt * Math.PI * 4;
          hand1X = nx + Math.cos(angle) * 18;
          hand1Y = ny + Math.sin(angle) * 18;
          hand2X = nx - Math.cos(angle) * 18;
          hand2Y = ny - Math.sin(angle) * 18;
        } else if (animName === 'Overhead Pierce') {
          const t = Math.sin(pt * Math.PI);
          hand1X = nx + 15 + t * 25;
          hand1Y = ny - 15 + t * 45;
          hand2X = hand1X - 6; hand2Y = hand1Y + 4;
        } else {
          // Finisher
          const spinAngle = pt * Math.PI * 4;
          const extend = strikeProgress * 40;
          hand1X = nx + Math.cos(spinAngle) * 24 + extend;
          hand1Y = ny + Math.sin(spinAngle) * 24 + 10;
          hand2X = nx - 10 + extend; hand2Y = ny + 20;
        }
      } else if (weapon === 'Axe') {
        if (animName === 'Cleave') {
          const chopAngle = -Math.PI * 0.7 + pt * (Math.PI * 1.0);
          hand1X = nx + Math.cos(chopAngle) * 35;
          hand1Y = ny + Math.sin(chopAngle) * 32;
          hand2X = hand1X - 4; hand2Y = hand1Y + 2;
        } else if (animName === 'Hack') {
          const chopAngle = -Math.PI * 0.5 + pt * (Math.PI * 0.8);
          hand1X = nx + Math.cos(chopAngle) * 33;
          hand1Y = ny + Math.sin(chopAngle) * 28;
          hand2X = nx - 10; hand2Y = ny + 20;
        } else if (animName === 'Spin Chop') {
          const spinAngle = pt * Math.PI * 2.0;
          hand1X = nx + Math.cos(spinAngle) * 35;
          hand1Y = ny + Math.sin(spinAngle) * 25;
          hand2X = hand1X - 4; hand2Y = hand1Y + 2;
        } else if (animName === 'Heavy Swing') {
          const swingAngle = -Math.PI * 0.85 + pt * (Math.PI * 1.25);
          hand1X = nx + Math.cos(swingAngle) * 36;
          hand1Y = ny + Math.sin(swingAngle) * 36;
          hand2X = hand1X - 5; hand2Y = hand1Y + 3;
        } else {
          // Finisher
          if (pt < 0.35) {
            hand1X = nx - 20; hand1Y = ny - 26;
          } else {
            const swingAngle = -Math.PI * 0.95 + (pt - 0.35)/0.65 * (Math.PI * 1.4);
            hand1X = nx + Math.cos(swingAngle) * 38;
            hand1Y = ny + Math.sin(swingAngle) * 38;
          }
          hand2X = hand1X - 4; hand2Y = hand1Y + 2;
        }
      } else if (weapon === 'Dual Sword') {
        const swingAngle1 = -Math.PI * 0.4 + pt * (Math.PI * 0.9);
        const swingAngle2 = -Math.PI * 0.8 + pt * (Math.PI * 0.9);
        if (animName === 'X-Slash') {
          hand1X = nx + Math.cos(swingAngle1) * 32;
          hand1Y = ny + Math.sin(swingAngle1) * 32;
          hand2X = nx - Math.cos(swingAngle2) * 32;
          hand2Y = ny + Math.sin(swingAngle2) * 32;
        } else if (animName === 'Double Thrust') {
          const extend = strikeProgress * 38;
          hand1X = nx + 15 + extend; hand1Y = ny + 2;
          hand2X = nx + 15 + extend; hand2Y = ny + 12;
        } else if (animName === 'Spin Slice') {
          const angle = pt * Math.PI * 2.0;
          hand1X = nx + Math.cos(angle) * 32; hand1Y = ny + Math.sin(angle) * 20;
          hand2X = nx - Math.cos(angle) * 32; hand2Y = ny - Math.sin(angle) * 20;
        } else if (animName === 'Furry Slash') {
          const angle1 = -Math.PI/2 + pt * Math.PI * 1.5;
          const angle2 = Math.PI/2 - pt * Math.PI * 1.5;
          hand1X = nx + Math.cos(angle1) * 30; hand1Y = ny + Math.sin(angle1) * 30;
          hand2X = nx + Math.cos(angle2) * 30; hand2Y = ny + Math.sin(angle2) * 30;
        } else {
          // Finisher
          const angle = pt * Math.PI * 4;
          hand1X = nx + Math.cos(angle) * 36; hand1Y = ny + Math.sin(angle) * 36;
          hand2X = nx - Math.cos(angle) * 36; hand2Y = ny - Math.sin(angle) * 36;
        }
      } else if (weapon === 'Knife') {
        if (animName === 'Quick stab' || animName === 'Lunging stab') {
          const extend = strikeProgress * 36;
          hand1X = nx + 16 + extend;
          hand1Y = ny + 4;
          hand2X = nx - 10; hand2Y = ny + 20;
        } else if (animName === 'Reverse grip stab') {
          const extend = strikeProgress * 32;
          hand1X = nx + 14 + extend;
          hand1Y = ny + 8 + extend * 0.5;
          hand2X = nx - 10; hand2Y = ny + 20;
        } else if (animName === 'Horizontal slash') {
          const swingAngle = -Math.PI * 0.4 + pt * (Math.PI * 0.95);
          hand1X = nx + Math.cos(swingAngle) * 34;
          hand1Y = ny + Math.sin(swingAngle) * 16;
          hand2X = nx - 12; hand2Y = ny + 22;
        } else if (animName === 'Diagonal slash') {
          const swingAngle = -Math.PI * 0.85 + pt * (Math.PI * 1.2);
          hand1X = nx + Math.cos(swingAngle) * 34;
          hand1Y = ny + Math.sin(swingAngle) * 34;
          hand2X = nx - 10; hand2Y = ny + 22;
        } else if (animName === 'Overhead slash') {
          const swingAngle = -Math.PI * 0.9 + pt * (Math.PI * 1.3);
          hand1X = nx + Math.cos(swingAngle) * 33;
          hand1Y = ny + Math.sin(swingAngle) * 33;
          hand2X = nx - 12; hand2Y = ny + 20;
        } else if (animName === 'Low sweep slash') {
          const swingAngle = -Math.PI * 0.3 + pt * (Math.PI * 0.8);
          hand1X = nx + Math.cos(swingAngle) * 34;
          hand1Y = ny + 15 + Math.sin(swingAngle) * 15;
          hand2X = nx - 10; hand2Y = ny + 18;
        } else if (animName === 'Spin slash') {
          const angle = pt * Math.PI * 2.0;
          hand1X = nx + Math.cos(angle) * 33;
          hand1Y = ny + Math.sin(angle) * 16;
          hand2X = nx - 12; hand2Y = ny + 22;
        } else if (animName === 'Jumping slash') {
          const swingAngle = -Math.PI * 0.7 + pt * (Math.PI * 1.1);
          hand1X = nx + Math.cos(swingAngle) * 34;
          hand1Y = ny + Math.sin(swingAngle) * 34;
          hand2X = nx - 10; hand2Y = ny + 16;
        } else {
          // Finisher slash
          if (pt < 0.35) {
            hand1X = nx - 15; hand1Y = ny - 20;
          } else {
            const swingAngle = -Math.PI * 0.8 + ((pt - 0.35) / 0.65) * (Math.PI * 1.3);
            hand1X = nx + Math.cos(swingAngle) * 36;
            hand1Y = ny + Math.sin(swingAngle) * 36;
          }
          hand2X = nx - 10; hand2Y = ny + 20;
        }
      } else if (isBareHands) {
        if (animName === 'Jab') {
          hand1X = nx + 44 * Math.sin(pt * Math.PI);
          hand1Y = ny + 2;
          hand2X = nx - 10; hand2Y = ny + 14;
        } else if (animName === 'Cross') {
          hand1X = nx - 8; hand1Y = ny + 14;
          hand2X = nx + 48 * Math.sin(pt * Math.PI);
          hand2Y = ny + 4;
        } else if (animName === 'Hook') {
          const hookAngle = -Math.PI / 3 + pt * Math.PI;
          hand1X = nx + Math.cos(hookAngle) * 36;
          hand1Y = ny + Math.sin(hookAngle) * 20;
          hand2X = nx - 8; hand2Y = ny + 12;
        } else if (animName === 'Uppercut') {
          hand1X = nx + 10;
          hand1Y = ny - 24 * Math.sin(pt * Math.PI);
          hand2X = nx - 12; hand2Y = ny + 10;
        } else if (animName === 'Elbow Strike') {
          hand1X = nx + 18 * Math.sin(pt * Math.PI);
          hand1Y = ny + 10;
          hand2X = nx - 8; hand2Y = ny + 14;
        } else if (animName === 'Palm Strike') {
          hand1X = nx + 40 * Math.sin(pt * Math.PI);
          hand1Y = ny + 5;
          hand2X = nx - 10; hand2Y = ny + 14;
        } else if (animName === 'Back Fist') {
          const swingAngle = -Math.PI / 2 + pt * Math.PI;
          hand1X = nx + Math.cos(swingAngle) * 38;
          hand1Y = ny + 10;
          hand2X = nx - 8; hand2Y = ny + 14;
        } else if (animName === 'Hammer Fist') {
          hand1X = nx + 15;
          hand1Y = ny + 15 + 30 * Math.sin(pt * Math.PI);
          hand2X = nx - 10; hand2Y = ny + 14;
        } else if (animName === 'Roundhouse Kick' || animName === 'Front Kick' || animName === 'Side Kick' || animName === 'Flying Knee' || animName === 'Jump Kick' || animName === 'Spinning Kick') {
          hand1X = nx + 8; hand1Y = ny + 14;
          hand2X = nx - 8; hand2Y = ny + 16;
        } else {
          // Finisher
          hand1X = nx + 46 * Math.sin(pt * Math.PI);
          hand1Y = ny - 10 * Math.sin(pt * Math.PI);
          hand2X = nx - 16; hand2Y = ny + 4;
        }
      }
    }

    // Footwork & Leg Poses based on animation name
    if (pState === 'JUMPING') {
      foot1X = hpx - 10; foot1Y = hpy + 20;
      foot2X = hpx + 10; foot2Y = hpy + 20;
    } else if (pState === 'MISS') {
      foot1X = hpx - 14; foot1Y = y;
      foot2X = hpx + 14; foot2Y = y;
    } else if (pState === 'FINISHER') {
      if (weapon === 'Bare Hands') {
        foot1X = hpx + 50 * Math.sin(pt * Math.PI);
        foot1Y = hpy + 8;
        foot2X = hpx - 14;
        foot2Y = hpy + 16;
      } else {
        foot1X = hpx - 8; foot1Y = hpy + 22;
        foot2X = hpx + 8; foot2Y = hpy + 22;
      }
    } else {
      if (animName === 'Roundhouse Kick') {
        foot1X = hpx - 14; foot1Y = y; 
        const kickAngle = -Math.PI / 4 + pt * (Math.PI * 1.35);
        foot2X = hpx + Math.cos(kickAngle) * 46;
        foot2Y = hpy + Math.sin(kickAngle) * 22;
      } else if (animName === 'Front Kick') {
        foot1X = hpx - 12; foot1Y = y;
        foot2X = hpx + 45 * Math.sin(pt * Math.PI);
        foot2Y = hpy - 10 * Math.sin(pt * Math.PI);
      } else if (animName === 'Side Kick') {
        foot1X = hpx - 10; foot1Y = y;
        foot2X = hpx + 48 * Math.sin(pt * Math.PI);
        foot2Y = hpy;
      } else if (animName === 'Flying Knee') {
        foot1X = hpx - 10; foot1Y = y;
        foot2X = hpx + 28 * Math.sin(pt * Math.PI);
        foot2Y = hpy + 12 - 30 * Math.sin(pt * Math.PI);
      } else if (animName === 'Jump Kick') {
        foot1X = hpx - 8; foot1Y = hpy + 15;
        foot2X = hpx + 48 * Math.sin(pt * Math.PI);
        foot2Y = hpy - 20 * Math.sin(pt * Math.PI);
      } else if (animName === 'Spinning Kick') {
        foot1X = hpx - 10; foot1Y = y;
        foot2X = hpx + Math.cos(pt * Math.PI * 2) * 44;
        foot2Y = hpy + Math.sin(pt * Math.PI * 2) * 15;
      } else if (animName === 'Jumping slash') {
        foot1X = hpx - 8; foot1Y = hpy + 18;
        foot2X = hpx + 8; foot2Y = hpy + 18;
      } else if (animName === 'Ground Slam') {
        foot1X = hpx - 22; foot1Y = y;
        foot2X = hpx + 22; foot2Y = y;
      } else {
        // Walking/pivot step footwork (never stand perfectly still during hits)
        const walkT = Math.sin(pt * Math.PI);
        foot1X = hpx - 18 - walkT * 6;
        foot1Y = y;
        foot2X = hpx + 18 + walkT * 12;
        foot2Y = y;
      }
    }

    return { hx, hy, nx, ny, hpx, hpy, hand1X, hand1Y, hand2X, hand2Y, foot1X, foot1Y, foot2X, foot2Y };
  }

  private drawPlayer(timestamp: number) {
    const ctx = this.ctx;
    const rawT = this.playerState === 'IDLE' ? 0 : this.playerAnimTime / this.playerAnimDuration;
    const pt = this.easeInOutCubic(rawT);

    // 1. Calculate active target pose
    let pose = this.calculatePlayerPose(timestamp, this.playerState, this.playerAnimTime, this.playerAnimDuration, this.activeAnimation);

    // 2. Perform LERP pose blending
    if (this.blendStartPose && this.blendTimer > 0) {
      const r = this.blendTimer / this.blendDuration; // goes from 1.0 down to 0.0
      const ir = 1.0 - r;

      pose = {
        hx: this.blendStartPose.hx * r + pose.hx * ir,
        hy: this.blendStartPose.hy * r + pose.hy * ir,
        nx: this.blendStartPose.nx * r + pose.nx * ir,
        ny: this.blendStartPose.ny * r + pose.ny * ir,
        hpx: this.blendStartPose.hpx * r + pose.hpx * ir,
        hpy: this.blendStartPose.hpy * r + pose.hpy * ir,
        hand1X: this.blendStartPose.hand1X * r + pose.hand1X * ir,
        hand1Y: this.blendStartPose.hand1Y * r + pose.hand1Y * ir,
        hand2X: this.blendStartPose.hand2X * r + pose.hand2X * ir,
        hand2Y: this.blendStartPose.hand2Y * r + pose.hand2Y * ir,
        foot1X: this.blendStartPose.foot1X * r + pose.foot1X * ir,
        foot1Y: this.blendStartPose.foot1Y * r + pose.foot1Y * ir,
        foot2X: this.blendStartPose.foot2X * r + pose.foot2X * ir,
        foot2Y: this.blendStartPose.foot2Y * r + pose.foot2Y * ir
      };
    }

    // 3. Setup draw styling
    ctx.strokeStyle = '#10b981';
    ctx.shadowBlur = 10;
    if (this.combo >= 25) {
      ctx.strokeStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 18;
    } else if (this.combo >= 10) {
      ctx.strokeStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 14;
    } else {
      ctx.shadowColor = '#10b981';
    }

    ctx.lineWidth = 4.5; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 4. Draw weapon trail
    const isAttack = this.playerState === 'ATTACK' || this.playerState === 'FINISHER';
    if (isAttack) {
      ctx.save();
      const isFinisher = this.playerState === 'FINISHER';
      const trailColor = isFinisher ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.08)';
      const trailCount = isFinisher ? 5 : 3;
      
      for (let i = 0; i < trailCount; i++) {
        ctx.globalAlpha = (isFinisher ? 0.28 : 0.18) - i * (isFinisher ? 0.05 : 0.06);
        ctx.lineWidth = (isFinisher ? 48 : 32) - i * 8; 
        ctx.lineCap = 'round';
        ctx.strokeStyle = trailColor;
        
        ctx.beginPath();
        if (isFinisher) {
          ctx.arc(pose.nx, pose.ny, 62, -Math.PI * 0.9, -Math.PI * 0.9 + pt * (Math.PI * 1.6));
        } else {
          ctx.arc(pose.nx, pose.ny, 55, -Math.PI / 3, -Math.PI / 3 + pt * (Math.PI * 1.3));
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Draw body elements
    // Head
    ctx.beginPath();
    ctx.arc(pose.hx, pose.hy, 12, 0, Math.PI * 2); 
    ctx.stroke();

    // Cap (rotated with body lean tilt)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const tiltEst = (pose.nx - pose.hx) / 14;
    ctx.ellipse(pose.hx, pose.hy - 11, 14, 8, tiltEst, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pose.hx + 8, pose.hy - 7);
    ctx.lineTo(pose.hx + 18, pose.hy - 7);
    ctx.stroke();

    // Glasses
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.rect(pose.hx + 3, pose.hy - 2, 7, 7);
    ctx.rect(pose.hx + 11, pose.hy - 2, 7, 7);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pose.hx + 3, pose.hy + 2);
    ctx.lineTo(pose.hx + 11, pose.hy + 2);
    ctx.stroke();

    ctx.lineWidth = 4.5;
    if (this.combo >= 25) {
      ctx.strokeStyle = '#a855f7';
    } else if (this.combo >= 10) {
      ctx.strokeStyle = '#f97316';
    } else {
      ctx.strokeStyle = '#10b981';
    }

    // Torso
    ctx.beginPath();
    ctx.moveTo(pose.nx, pose.ny);
    ctx.lineTo(pose.hpx, pose.hpy);
    ctx.stroke();

    // Segmented Limbs
    this.drawSegmentedLimb(ctx, pose.nx, pose.ny + 6, pose.hand1X, pose.hand1Y, 1);
    this.drawSegmentedLimb(ctx, pose.nx, pose.ny + 6, pose.hand2X, pose.hand2Y, -1);
    this.drawSegmentedLimb(ctx, pose.hpx, pose.hpy, pose.foot1X, pose.foot1Y, -1, 0.45);
    this.drawSegmentedLimb(ctx, pose.hpx, pose.hpy, pose.foot2X, pose.foot2Y, 1, 0.45);

    // Draw Weapon attached to Hand 1
    this.drawWeapon(pose.hand1X, pose.hand1Y, pose.nx, pose.ny);
    ctx.shadowBlur = 0;
  }

  private drawWeapon(handX: number, handY: number, shoulderX: number, shoulderY: number) {
    const ctx = this.ctx;
    const weapon = WEAPONS[this.currentWeaponIndex];
    if (weapon === 'Bare Hands') return;

    ctx.save();
    ctx.lineJoin = 'miter';

    const angle = Math.atan2(handY - shoulderY, handX - shoulderX);
    ctx.translate(handX, handY);
    ctx.rotate(angle);

    const isLaser = weapon === 'Sword' || weapon === 'Katana' || weapon === 'Dual Sword';
    if (isLaser) {
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#ff0000'; 
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.lineWidth = 3.5;

    if (weapon === 'Sword') {
      ctx.fillStyle = '#ffffff'; 
      ctx.strokeStyle = '#ef4444'; 
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.rect(0, -5.5, 45, 11);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(0, 14);
      ctx.stroke();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, 0);
      ctx.stroke();
    } else if (weapon === 'Hammer') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(28, 0);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.rect(26, -14, 15, 28);
      ctx.fill();
      ctx.stroke();
    } else if (weapon === 'Katana') {
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(22, -3, 44, -7);
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, 1);
      ctx.stroke();
    } else if (weapon === 'Spear') {
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(55, 0);
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(55, -6);
      ctx.lineTo(72, 0);
      ctx.lineTo(55, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (weapon === 'Axe') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(25, 0);
      ctx.quadraticCurveTo(38, -18, 42, -22);
      ctx.lineTo(20, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (weapon === 'Dual Sword') {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff0000';
      ctx.lineWidth = 3.5;
      
      ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.rect(0, -3.5, 32, 7);
      ctx.fill();
      ctx.stroke();
      
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.rect(0, -3.5, 32, 7);
      ctx.fill();
      ctx.stroke();
    } else if (weapon === 'Knife') {
      ctx.fillStyle = '#cbd5e1'; 
      ctx.strokeStyle = '#334155'; 
      ctx.lineWidth = 2.0;

      const isReverseGrip = this.activeAnimation === 'Reverse grip stab' || this.activeAnimation === 'Finisher slash';
      if (isReverseGrip) {
        ctx.rotate(Math.PI * 0.85); // flip knife backwards
      } else {
        ctx.rotate(-Math.PI * 0.15); // angle knife forward
      }

      // Draw knife blade (sharp wedge)
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(20, -3);
      ctx.lineTo(25, 0); // sharp tip
      ctx.lineTo(20, 3);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Knife hilt / guard
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();

      // Knife handle
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawEnemy(enemy: Enemy) {
    const ctx = this.ctx;
    const direction = enemy.side === 'left' ? 1 : -1;

    const offsets = this.getEnemyOffsets();
    const dx = offsets.dx;
    const dy = offsets.dy;
    const tilt = offsets.tilt;

    const x = enemy.position.x + dx;
    const y = enemy.position.y + dy;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);

    ctx.strokeStyle = enemy.color;
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 4.0; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const headY = -90;
    const torsoTopY = -76;
    const hipsY = -42;

    // 1. Head
    ctx.beginPath();
    ctx.arc(direction * 4, headY, 11, 0, Math.PI * 2);
    ctx.stroke();

    // Glasses
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(direction * 4 + 2, headY, 4.5, 0, Math.PI * 2);
    ctx.arc(direction * 4 - 8, headY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(direction * 4 - 3.5, headY);
    ctx.lineTo(direction * 4 - 3.5, headY);
    ctx.stroke();

    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 4.0;

    // 2. Torso
    ctx.beginPath();
    ctx.moveTo(direction * 4, torsoTopY);
    ctx.lineTo(-direction * 4, hipsY);
    ctx.stroke();

    // 3. Arms
    let hand1X = direction * 10;
    let hand1Y = -52;
    let hand2X = -direction * 4;
    let hand2Y = -52;

    if (this.enemyState === 'BLOCK') {
      hand1X = direction * 15; hand1Y = headY - 8;
      hand2X = direction * 8; hand2Y = headY - 12;
    } else if (this.enemyState === 'STAGGER' || this.enemyState === 'KNOCKBACK' || this.enemyState === 'HEAVY_STAGGER') {
      hand1X = direction * 24; hand1Y = headY + 15;
      hand2X = -direction * 18; hand2Y = headY + 28;
    } else if (this.enemyState === 'HEAD_HIT' || this.enemyState === 'BODY_HIT') {
      hand1X = direction * 16; hand1Y = headY + 20;
      hand2X = -direction * 12; hand2Y = headY + 20;
    }

    this.drawSegmentedLimb(ctx, direction * 4, torsoTopY + 6, hand1X, hand1Y, 1);
    this.drawSegmentedLimb(ctx, direction * 4, torsoTopY + 6, hand2X, hand2Y, -1);

    // 4. Legs
    let foot1X = -18;
    let foot1Y = 0;
    let foot2X = 18;
    let foot2Y = 0;

    if (this.enemyState === 'STAGGER' || this.enemyState === 'KNOCKBACK' || this.enemyState === 'HEAVY_STAGGER') {
      foot1X = -28; foot1Y = headY + 30;
      foot2X = 12; foot2Y = headY + 44;
    }

    this.drawSegmentedLimb(ctx, -direction * 4, hipsY, foot1X, foot1Y, -1, 0.45);
    this.drawSegmentedLimb(ctx, -direction * 4, hipsY, foot2X, foot2Y, 1, 0.45);

    ctx.restore();
    ctx.shadowBlur = 0;

    // --- Draw Target Word Slices ---
    const textX = x;
    const textY = y + headY - 32; 

    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    let segmentStart = 0;
    for (let i = this.currentIndex; i >= 0; i--) {
      if (i < this.currentIndex && (this.practiceText[i] === ' ' || this.practiceText[i] === '\n')) {
        segmentStart = i + 1;
        break;
      }
    }

    let segmentEnd = this.practiceText.length;
    let spaceCount = 0;
    for (let i = this.currentIndex; i < this.practiceText.length; i++) {
      if (this.practiceText[i] === ' ' || this.practiceText[i] === '\n') {
        spaceCount++;
        if (spaceCount >= 2) { 
          segmentEnd = i;
          break;
        }
      }
    }

    const wordSegment = this.practiceText.substring(segmentStart, segmentEnd);
    const segmentTypedLength = this.currentIndex - segmentStart;

    const displayWord = wordSegment.replace(/\n/g, '↵');
    const typed = displayWord.substring(0, segmentTypedLength);
    const activeChar = displayWord.charAt(segmentTypedLength) || '↵';
    const remaining = displayWord.substring(segmentTypedLength + 1);

    const typedW = ctx.measureText(typed).width;
    const activeW = ctx.measureText(activeChar).width;
    const remainingW = ctx.measureText(remaining).width;
    const totalWidth = typedW + activeW + remainingW;

    const startX = textX - totalWidth / 2;

    ctx.fillStyle = 'rgba(5, 6, 8, 0.78)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    
    const padX = 8;
    const padY = 6;
    const rX = startX - padX;
    const rY = textY - padY - 8;
    const rW = totalWidth + padX * 2;
    const rH = 16 + padY * 2;
    const rR = 4;

    ctx.beginPath();
    ctx.moveTo(rX + rR, rY);
    ctx.lineTo(rX + rW - rR, rY);
    ctx.arcTo(rX + rW, rY, rX + rW, rY + rH, rR);
    ctx.arcTo(rX + rW, rY + rH, rX, rY + rH, rR);
    ctx.arcTo(rX, rY + rH, rX, rY, rR);
    ctx.arcTo(rX, rY, rX + rW, rY, rR);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (typed.length > 0) {
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 4;
      ctx.fillText(typed, startX, textY);
      ctx.shadowBlur = 0;
    }

    const activeX = startX + typedW;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(activeX - 1, textY - 9, activeW + 2, 17);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(activeChar, activeX, textY);

    if (remaining.length > 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(remaining, activeX + activeW, textY);
    }

    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(activeX + activeW / 2, textY - 18);
    ctx.lineTo(activeX + activeW / 2 - 4, textY - 24);
    ctx.lineTo(activeX + activeW / 2 + 4, textY - 24);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
