import { Projectile } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Enemy {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.prevY = this.y;
    this.type = options.type || 'GUMMY'; // 'GUMMY', 'TURRET', 'DRONE', 'GLOBO', 'PEZ', 'ROLLER', 'SNIPER', 'MOTH', 'KNIGHT'
    this.width = options.width || 52;
    this.height = options.height || 62;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 950;
    this.isGrounded = false;
    this.facing = -1;
    this.hp = options.hp || 24;
    this.maxHp = this.hp;
    this.scoreValue = options.scoreValue || 200;
    this.dead = false;

    // AI & Procedural Animation Variables
    this.shootTimer = Math.random() * 1.5;
    this.shootInterval = options.shootInterval || (options.level ? Math.max(1.8, 3.4 - options.level * 0.18) : 3.0);
    this.isAiming = false;
    this.aimTimer = 0;
    this.aimTelegraphDuration = options.level ? Math.max(0.3, 0.6 - options.level * 0.04) : 0.55;
    this.burstRemaining = 0;
    this.burstTimer = 0;
    this.hurtTimer = 0;
    this.hitWobble = 0;
    this.wobblePhase = 0;
    this.rotation = 0;
    this.isStumbling = false;
    this.stumbleTimer = 0;
    this.deathType = null;
    this.meltProgress = 0;
    this.freezeProgress = 0;
    this.lastHitWeapon = '';
    this.helmetPopped = false;
    this.animTime = Math.random() * 5;
    this.hoverY = this.y;
    this.speed = options.speed || 55;
    this.patrolDir = -1;

    // Specific enemy type configurations
    if (this.type === 'TURRET') {
      this.gravity = 0;
      this.width = 62;
      this.height = 62;
      this.hp = 45;
      this.scoreValue = 350;
      this.aimAngle = Math.PI;
    } else if (this.type === 'DRONE' || this.type === 'GLOBO') {
      this.gravity = 0;
      this.width = 58;
      this.height = 66;
      this.hp = 25;
      this.scoreValue = 300;
    } else if (this.type === 'PEZ') {
      this.gravity = 0;
      this.width = 62;
      this.height = 50;
      this.hp = 22;
      this.scoreValue = 280;
      this.waveSpeed = 4;
      this.waveAmp = 35;
    } else if (this.type === 'ROLLER') {
      this.gravity = 950;
      this.width = 58;
      this.height = 58;
      this.hp = 22;
      this.scoreValue = 350;
      this.speed = 50;
      this.chargeSpeed = 125;
      this.rollerState = 'PATROL'; // 'PATROL', 'TELEGRAPH', 'CHARGING', 'TIRED'
      this.rollerTimer = 0;
      this.rollerChargeDir = -1;
    } else if (this.type === 'SNIPER') {
      this.gravity = 0;
      this.width = 58;
      this.height = 70;
      this.hp = 28;
      this.scoreValue = 450;
      this.aimCycleTimer = 0;
      this.isAimingLaser = false;
      this.laserTargetX = 0;
      this.laserTargetY = 0;
    } else if (this.type === 'MOTH') {
      this.gravity = 0;
      this.width = 68;
      this.height = 58;
      this.hp = 20;
      this.scoreValue = 320;
      this.isDiving = false;
      this.diveCooldown = 0;
      this.waveSpeed = 4.5;
      this.waveAmp = 38;
    } else if (this.type === 'KNIGHT') {
      this.gravity = 950;
      this.width = 66;
      this.height = 74;
      this.hp = options.hp || 20;
      this.scoreValue = 500;
      this.speed = 45;
      this.shieldUp = true;
      this.stabTimer = 0;
      this.isStabbing = false;
    } else if (this.type === 'LATIGO') {
      this.gravity = 950;
      this.width = 60;
      this.height = 70;
      this.hp = 38;
      this.scoreValue = 480;
      this.speed = 48;
      this.whipState = 'PATROL'; // 'PATROL', 'TELEGRAPH', 'WHIP', 'RECOVER'
      this.whipTimer = 0;
    } else if (this.type === 'ACIDO') {
      this.gravity = 0;
      this.width = 62;
      this.height = 54;
      this.hp = 26;
      this.scoreValue = 360;
      this.spitTimer = 0;
      this.waveSpeed = 3.5;
      this.waveAmp = 32;
      this.spitInterval = 2.4;
    } else if (this.type === 'RANA') {
      this.gravity = 950;
      this.width = 60;
      this.height = 58;
      this.hp = 32;
      this.scoreValue = 420;
      this.speed = 60;
      this.frogState = 'CROUCH'; // 'CROUCH', 'JUMPING', 'LAND'
      this.frogTimer = 0.7;
    } else if (this.type === 'ANGUILA') {
      this.gravity = 500;
      this.width = 72;
      this.height = 52;
      this.hp = 34;
      this.scoreValue = 460;
      this.eelState = 'SUBMERGED'; // 'SUBMERGED', 'SURGE', 'DISCHARGE', 'DIVE'
      this.eelTimer = 1.0;
      this.baseY = this.y;
    } else if (this.type === 'PINGUINO') {
      this.gravity = 950;
      this.width = 64;
      this.height = 48;
      this.hp = 34;
      this.scoreValue = 440;
      this.speed = 190;
      this.slideTimer = 0;
      this.shootTimer = 0;
    } else if (this.type === 'YETI') {
      this.gravity = 950;
      this.width = 86;
      this.height = 90;
      this.hp = 58;
      this.scoreValue = 580;
      this.speed = 40;
      this.slamState = 'WALK'; // 'WALK', 'PREPARE', 'SLAM', 'RECOVER'
      this.slamTimer = 2.0;
    } else if (this.type === 'MURCIELAGO') {
      this.gravity = 0;
      this.width = 62;
      this.height = 54;
      this.hp = 28;
      this.scoreValue = 400;
      this.speed = 80;
      this.batState = 'ROOST'; // 'ROOST', 'SWOOP'
      this.batTimer = 0;
      this.hoverY = this.y;
    } else if (this.type === 'SLIME') {
      this.gravity = 950;
      this.width = 64;
      this.height = 48;
      this.hp = 36;
      this.scoreValue = 380;
      this.speed = 45;
      this.spitTimer = 0;
    } else if (this.type === 'SALAMANDRA') {
      this.gravity = 950;
      this.width = 72;
      this.height = 48;
      this.hp = 42;
      this.scoreValue = 450;
      this.speed = 85;
      this.fireTimer = 0;
    } else if (this.type === 'AVISPA_FUEGO') {
      this.gravity = 0;
      this.width = 62;
      this.height = 54;
      this.hp = 30;
      this.scoreValue = 420;
      this.speed = 90;
      this.hoverY = this.y;
      this.shootTimer = 0;
    } else if (this.type === 'GARGOYLA') {
      this.gravity = 0;
      this.width = 70;
      this.height = 64;
      this.hp = 44;
      this.scoreValue = 480;
      this.speed = 80;
      this.hoverY = this.y;
      this.shootTimer = 0;
    } else if (this.type === 'GUARDIA_REAL') {
      this.gravity = 950;
      this.width = 72;
      this.height = 82;
      this.hp = 60;
      this.scoreValue = 600;
      this.speed = 40;
      this.shieldUp = true;
      this.thrustTimer = 0;
    } else if (this.type === 'HECHICERO_DULCE') {
      this.gravity = 0;
      this.width = 66;
      this.height = 72;
      this.hp = 52;
      this.scoreValue = 650;
      this.speed = 70;
      this.hoverY = this.y;
      this.castTimer = 0;
    } else {
      this.type = 'GUMMY';
    }
  }

  takeDamage(amount, particles, soundManager, attackerX = 0, weaponType = '') {
    const enemyColorMap = {
      GUMMY: '#EF4444',
      ROLLER: '#22C55E',
      SNIPER: '#0284C7',
      MOTH: '#EC4899',
      KNIGHT: '#F59E0B',
      TURRET: '#D97706',
      ACIDO: '#84CC16',
      RANA: '#10B981',
      ANGUILA: '#06B6D4',
      PINGUINO: '#38BDF8',
      YETI: '#E0F2FE',
      MURCIELAGO: '#9333EA',
      SLIME: '#84CC16',
      SALAMANDRA: '#EA580C',
      AVISPA_FUEGO: '#F59E0B',
      GARGOYLA: '#3F3F46',
      GUARDIA_REAL: '#475569',
      HECHICERO_DULCE: '#581C87',
      PEZ: '#06B6D4',
      DRONE: '#EC4899',
      GLOBO: '#EC4899'
    };
    const enemyColor = enemyColorMap[this.type] || '#EF4444';
    this.lastHitWeapon = weaponType;

    // Knight & Royal Guard shield mechanic: blocks frontal projectile damage
    if ((this.type === 'KNIGHT' || this.type === 'GUARDIA_REAL') && this.shieldUp && attackerX) {
      const attackingFromFront = (this.facing === -1 && attackerX < this.x + this.width / 2) ||
                                 (this.facing === 1 && attackerX > this.x + this.width / 2);
      if (attackingFromFront) {
        // Shield absorbs most damage and clinks
        soundManager.playEnemyPop();
        if (particles) {
          particles.emitSparkles(this.x + (this.facing === -1 ? 8 : this.width - 8), this.y + 24, 6, '#FBBF24');
          particles.emitCandyShards(this.x + (this.facing === -1 ? 8 : this.width - 8), this.y + 24, 4);
        }
        this.hp -= Math.max(1, Math.round(amount * 0.5));
        this.hurtTimer = 0.05;
        if (this.hp <= 0) this.die(particles, soundManager, 'EXPLODE');
        return;
      }
    }

    this.hp -= amount;
    this.hurtTimer = 0.10;
    this.hitWobble = 0.38; // Volumetric gelatin deformation wave
    this.wobblePhase = 0;
    soundManager.playEnemyPop();

    if (this.gravity > 0 && attackerX) {
      this.vx = (this.x < attackerX ? -130 : 130);
      this.vy = -120;
    }

    // Micro-reaction: Flying gelatin chunk droplets & impact flash on every hit
    if (particles) {
      if (typeof particles.emitHitImpactFlash === 'function') {
        particles.emitHitImpactFlash(this.x + this.width / 2, this.y + this.height / 2);
      }
      if (typeof particles.emitGummyDebris === 'function') {
        particles.emitGummyDebris(this.x + this.width / 2, this.y + this.height / 2, enemyColor, 4);
      }
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 5);
      particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 5, enemyColor);
    }

    // Flying Helmet pop off on critical damage or defeat
    if (!this.helmetPopped && (this.type === 'KNIGHT' || this.type === 'GUARDIA_REAL') && (this.hp <= 22 || this.hp <= 0)) {
      this.helmetPopped = true;
      if (particles && typeof particles.emitFlyingHelmet === 'function') {
        particles.emitFlyingHelmet(this.x + this.width / 2, this.y + 10, this.facing, this.type === 'GUARDIA_REAL' ? 'guard' : 'knight');
      }
    }

    if (this.hp <= 0) {
      const isMelt = (weaponType === 'FLAME_BLAST' || weaponType === 'LANZALLAMAS' || weaponType === 'BUBBLE' || weaponType === 'CANON_BURBUJAS' || weaponType === 'LATIGO_DULCE' || weaponType === 'ACIDO');
      const isShatter = (weaponType === 'ICE_SHARD' || weaponType === 'LANZAHIELOS' || weaponType === 'LASER_BEAM' || weaponType === 'RAYO_LASER');
      const isExplode = (weaponType === 'ROCKET' || weaponType === 'GRENADE' || weaponType === 'PLASMA_ORB' || weaponType === 'COSMIC_BURST' || weaponType === 'SHOTGUN');

      if (isMelt) {
        // 1. THEMATIC DEATH: MELT IN VISCOUS SYRUP PUDDLE
        this.deathType = 'MELT';
        this.isStumbling = true;
        this.stumbleTimer = 0.48;
        this.vx = 0;
        if (particles && typeof particles.emitSyrupBoilPool === 'function') {
          particles.emitSyrupBoilPool(this.x + this.width / 2, this.y + this.height - 4, enemyColor);
        }
      } else if (isShatter) {
        // 2. THEMATIC DEATH: FREEZE & SHATTER INTO HARD CANDY GLASS
        this.deathType = 'SHATTER';
        this.isStumbling = true;
        this.stumbleTimer = 0.32;
        this.vx = 0;
        if (particles) {
          particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 14, '#38BDF8');
        }
      } else if (isExplode) {
        // 3. THEMATIC DEATH: EXPLODE IN SHREDDED GUMMY & CONFETTI
        this.deathType = 'EXPLODE';
        this.die(particles, soundManager, 'EXPLODE');
      } else {
        // 4. DEFAULT COMICAL STUMBLE OR INSTANT COLLAPSE
        const canStumble = (this.type === 'GUMMY' || this.type === 'KNIGHT' || this.type === 'GUARDIA_REAL' || this.type === 'ROLLER' || this.type === 'SNIPER' || this.type === 'RANA' || this.type === 'YETI');
        if (canStumble && !this.isStumbling) {
          this.deathType = 'STUMBLE';
          this.isStumbling = true;
          this.stumbleTimer = 0.42;
          this.vx = (this.facing === 1 ? -65 : 65);
          this.vy = -95;
          if (particles) {
            particles.emitSparkles(this.x + this.width / 2, this.y - 6, 8, '#FEF08A');
          }
        } else if (!this.isStumbling) {
          this.die(particles, soundManager, 'EXPLODE');
        }
      }
    }
  }

  die(particles, soundManager, deathType = this.deathType) {
    this.dead = true;

    const enemyColorMap = {
      GUMMY: '#EF4444',
      ROLLER: '#22C55E',
      SNIPER: '#0284C7',
      MOTH: '#EC4899',
      KNIGHT: '#F59E0B',
      TURRET: '#D97706',
      ACIDO: '#84CC16',
      RANA: '#10B981',
      ANGUILA: '#06B6D4',
      PINGUINO: '#38BDF8',
      YETI: '#E0F2FE',
      MURCIELAGO: '#9333EA',
      SLIME: '#84CC16',
      SALAMANDRA: '#EA580C',
      AVISPA_FUEGO: '#F59E0B',
      GARGOYLA: '#3F3F46',
      GUARDIA_REAL: '#475569',
      HECHICERO_DULCE: '#581C87',
      PEZ: '#06B6D4',
      DRONE: '#EC4899',
      GLOBO: '#EC4899'
    };
    const debrisColor = enemyColorMap[this.type] || '#EF4444';

    if (deathType === 'MELT') {
      soundManager.playEnemyPop();
      if (particles) {
        if (typeof particles.emitSyrupBoilPool === 'function') {
          particles.emitSyrupBoilPool(this.x + this.width / 2, this.y + this.height, debrisColor);
        }
        particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height, 20, debrisColor);
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height - 8, 8, '#FBCFE8');
      }
    } else if (deathType === 'SHATTER') {
      soundManager.playEnemyPop();
      if (particles) {
        if (typeof particles.emitGlassCandyShards === 'function') {
          particles.emitGlassCandyShards(this.x + this.width / 2, this.y + this.height / 2, 26);
        }
        particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 16, '#FFFFFF');
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 6, '#E0F2FE');
      }
    } else if (deathType === 'EXPLODE') {
      soundManager.playExplosion();
      if (particles) {
        if (typeof particles.emitShockwave === 'function') {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 85, 'rgba(254, 205, 211, 0.9)');
        }
        if (typeof particles.emitGummyDebris === 'function') {
          particles.emitGummyDebris(this.x + this.width / 2, this.y + this.height / 2, debrisColor, 22);
        }
        particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 35);
        particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 18);
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 10, '#FCA5A5');
      }
    } else {
      // Default pop & confetti
      soundManager.playExplosion();
      if (particles) {
        if (typeof particles.emitGummyDebris === 'function') {
          particles.emitGummyDebris(this.x + this.width / 2, this.y + this.height / 2, debrisColor, 14);
        }
        particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 24, debrisColor);
        particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 20);
        particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 14);
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 8, '#FCA5A5');
      }
    }
  }

  checkCliffAhead(platforms) {
    if (!platforms || platforms.length === 0) return false;
    const checkX = this.x + (this.facing === 1 ? this.width + 12 : -12);
    const checkY = this.y + this.height + 15;
    for (const plat of platforms) {
      if (plat.type === 'acid_pool' || plat.type === 'soda_tide' || plat.type === 'lava_caramel' || plat.type === 'spikes') continue;
      if (checkX >= plat.x && checkX <= plat.x + plat.width && checkY >= plat.y && checkY <= plat.y + plat.height + 35) {
        return false;
      }
    }
    return true;
  }

  update(dt, player, platforms, enemyProjectiles, particles, soundManager, camera) {
    if (this.dead) return;

    this.animTime += dt;
    this.prevY = this.y;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    if (this.hitWobble > 0.001) {
      this.wobblePhase += dt * 30;
      this.hitWobble *= Math.exp(-dt * 10);
    } else {
      this.hitWobble = 0;
    }

    if (camera && !camera.isVisible(this.x, this.y, this.width, this.height, 400)) {
      return;
    }

    // Calculate nearest ground/platform Y below enemy for grounded contact shadow
    let detectedGroundY = 460;
    if (platforms && platforms.length > 0) {
      const eBottom = this.y + this.height;
      const eMidX = this.x + this.width / 2;
      let closestY = 9999;
      for (const plat of platforms) {
        if (plat.type === 'acid_pool' || plat.type === 'soda_tide' || plat.type === 'lava_caramel' || plat.type === 'spikes') continue;
        if (eMidX >= plat.x - 10 && eMidX <= plat.x + plat.width + 10) {
          if (plat.y >= eBottom - 12 && plat.y < closestY) {
            closestY = plat.y;
          }
        }
      }
      if (closestY < 9999) detectedGroundY = closestY;
    }
    this.groundY = this.isGrounded ? this.y + this.height : detectedGroundY;

    // Thematic Death Sequences (Melt in Syrup, Shatter, Comical Stumble)
    if (this.isStumbling) {
      this.stumbleTimer -= dt;

      if (this.deathType === 'MELT') {
        this.meltProgress = Math.min(1, 1 - (this.stumbleTimer / 0.48));
        this.vx = 0;
        this.rotation = (Math.random() - 0.5) * 0.08;
        if (particles && Math.random() < 0.25) {
          particles.emitSugarSmoke(this.x + this.width / 2 + (Math.random() - 0.5) * 20, this.y + this.height - 4, 1, '#FBCFE8');
        }
      } else if (this.deathType === 'SHATTER') {
        this.freezeProgress = Math.min(1, 1 - (this.stumbleTimer / 0.32));
        this.vx = 0;
        this.rotation = (Math.random() - 0.5) * 0.12;
      } else {
        this.rotation = Math.sin(this.animTime * 28) * 0.42;
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);

      if (this.stumbleTimer <= 0) {
        this.die(particles, soundManager, this.deathType);
      }
      return;
    }

    const distToPlayer = player ? Math.hypot(player.x - this.x, player.y - this.y) : 999;
    const dirToPlayer = player && player.x < this.x ? -1 : 1;
    const pCenterX = player ? player.x + player.width / 2 : this.x;
    const pCenterY = player ? player.y + player.height / 2 : this.y;

    // 1. PEZ
    if (this.type === 'PEZ') {
      this.facing = dirToPlayer;
      this.x -= 85 * dt;
      this.y = this.hoverY + Math.sin(this.animTime * this.waveSpeed) * this.waveAmp;
      this.rotation = Math.sin(this.animTime * 3) * 0.12;

      this.shootTimer += dt;
      if (this.shootTimer >= 2.0 && distToPlayer < 380) {
        this.shootTimer = 0;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: this.facing * 240,
            vy: 60,
            type: 'ENEMY_BULLET',
            damage: 1,
            isPlayer: false
          })
        );
        if (particles) particles.emitSodaBubbles(this.x + this.width / 2, this.y + this.height / 2, 4);
      }
      return;
    }

    // 2. GLOBO / DRONE
    if (this.type === 'DRONE' || this.type === 'GLOBO') {
      this.y = this.hoverY + Math.sin(this.animTime * 3) * 12;
      this.x += Math.sin(this.animTime * 1.2) * 50 * dt;
      this.rotation = Math.sin(this.animTime * 1.5) * 0.08;

      this.shootTimer += dt;
      if (this.shootTimer >= 2.4 && player && Math.abs(player.x - this.x) < 220) {
        this.shootTimer = 0;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + this.width / 2 - 4,
            y: this.y + this.height,
            vx: 0,
            vy: 220,
            type: 'ENEMY_BULLET',
            damage: 1,
            isPlayer: false
          })
        );
        if (particles) particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height, 3, '#FDE68A');
      }
      return;
    }

    // 3. TURRET
    if (this.type === 'TURRET') {
      if (player) {
        const targetAngle = Math.atan2(player.y + player.height / 2 - (this.y + 20), player.x + player.width / 2 - (this.x + 22));
        this.aimAngle += (targetAngle - this.aimAngle) * Math.min(1, dt * 4);
      }

      this.shootTimer += dt;
      if (this.shootTimer >= this.shootInterval && distToPlayer < 480) {
        this.shootTimer = 0;
        const bSpeed = 280;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + 22 + Math.cos(this.aimAngle) * 20,
            y: this.y + 20 + Math.sin(this.aimAngle) * 20,
            vx: Math.cos(this.aimAngle) * bSpeed,
            vy: Math.sin(this.aimAngle) * bSpeed,
            type: 'GUMBALL',
            damage: 1,
            isPlayer: false,
            color: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'][Math.floor(Math.random() * 4)]
          })
        );
        if (particles) particles.emitSugarSmoke(this.x + 22, this.y + 20, 3, '#FEF08A');
      }
      return;
    }

    // 4. ROLLER (Green Gummy Wheel - Patrols, Telegraphs, Charges with Momentum, Rests)
    if (this.type === 'ROLLER') {
      const inFrontOfRoller = (this.patrolDir === -1 && player && player.x < this.x) ||
                              (this.patrolDir === 1 && player && player.x > this.x);
      const inSight = distToPlayer < 260 && Math.abs(player.y - this.y) < 90 && inFrontOfRoller;

      if (this.rollerState === 'PATROL') {
        if (this.isGrounded && this.checkCliffAhead(platforms)) {
          this.patrolDir = -this.patrolDir;
          this.facing = this.patrolDir;
        }
        this.vx = this.patrolDir * this.speed;
        this.facing = this.patrolDir;

        if (inSight) {
          this.rollerState = 'TELEGRAPH';
          this.rollerTimer = 0.45; // 0.45s revving up before charging (warning window for player!)
          this.rollerChargeDir = dirToPlayer;
          this.facing = dirToPlayer;
          this.vx = 0;
        }
      } else if (this.rollerState === 'TELEGRAPH') {
        this.vx = 0;
        this.rollerTimer -= dt;
        // Rev up shake & sweet smoke
        if (particles && Math.random() < 0.4) {
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height - 4, 1, '#86EFAC');
        }
        if (this.rollerTimer <= 0) {
          this.rollerState = 'CHARGING';
          this.rollerTimer = 1.0; // 1.0s charge dash duration
          this.facing = this.rollerChargeDir;
        }
      } else if (this.rollerState === 'CHARGING') {
        // Locked momentum direction! Does NOT follow player if player jumps over!
        this.vx = this.rollerChargeDir * this.chargeSpeed;
        this.rollerTimer -= dt;

        if (particles && Math.random() < 0.35) {
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height - 4, 2, '#86EFAC');
        }

        if (this.rollerTimer <= 0) {
          this.rollerState = 'TIRED';
          this.rollerTimer = 1.2; // 1.2s dizzy recovery cooldown (vulnerable window!)
        }
      } else if (this.rollerState === 'TIRED') {
        // Exhausted / resting after charge
        this.vx = 0;
        this.rollerTimer -= dt;
        this.rotation = Math.sin(this.animTime * 8) * 0.12;

        if (this.rollerTimer <= 0) {
          this.rollerState = 'PATROL';
          this.patrolDir = dirToPlayer;
        }
      }

      // Rolling rotation proportional to speed
      if (this.rollerState !== 'TIRED') {
        this.rotation += (this.vx * dt * 0.08);
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 5. SNIPER (Piruleta Marksman with Red Laser Sight)
    if (this.type === 'SNIPER') {
      this.facing = dirToPlayer;
      this.aimCycleTimer += dt;

      if (player) {
        this.laserTargetX = player.x + player.width / 2;
        this.laserTargetY = player.y + player.height / 2;
      }

      // 0.0 - 1.6s: Idle / Watch
      // 1.6 - 2.5s: Aiming laser
      // 2.5s: Fire high-speed sniper projectile!
      if (this.aimCycleTimer >= 1.6 && this.aimCycleTimer < 2.5) {
        this.isAimingLaser = true;
      } else if (this.aimCycleTimer >= 2.5) {
        this.isAimingLaser = false;
        this.aimCycleTimer = 0;

        if (distToPlayer < 650) {
          const muzzleX = this.x + (this.facing === -1 ? 2 : this.width - 2);
          const muzzleY = this.y + 24;
          const angle = Math.atan2(this.laserTargetY - muzzleY, this.laserTargetX - muzzleX);

          enemyProjectiles.push(
            new Projectile({
              x: muzzleX,
              y: muzzleY,
              vx: Math.cos(angle) * 440,
              vy: Math.sin(angle) * 440,
              type: 'ENEMY_BULLET',
              damage: 2,
              isPlayer: false,
              color: '#EF4444'
            })
          );
          if (particles) {
            particles.emitSugarSmoke(muzzleX, muzzleY, 5, '#FCA5A5');
            particles.emitSparkles(muzzleX, muzzleY, 6, '#EF4444');
          }
          soundManager.playEnemyPop();
        }
      }
      return;
    }

    // 6. MOTH (Sugar Moth with Dive Bomber Attack)
    if (this.type === 'MOTH') {
      this.facing = dirToPlayer;
      if (this.diveCooldown > 0) this.diveCooldown -= dt;

      if (!this.isDiving) {
        this.x -= 65 * dt;
        this.y = this.hoverY + Math.sin(this.animTime * this.waveSpeed) * this.waveAmp;
        this.rotation = Math.sin(this.animTime * 3) * 0.15;

        // Check if player is below for a dive bomb
        if (player && Math.abs(player.x - this.x) < 180 && player.y > this.y && this.diveCooldown <= 0) {
          this.isDiving = true;
          this.vy = 280;
          this.vx = this.facing * 120;
        }
      } else {
        // In dive mode
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation = this.facing * 0.45;

        if (particles && Math.random() < 0.4) {
          particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 2, '#F472B6');
        }

        // Pull out of dive when low enough or after hitting ground level
        if (this.y >= 430) {
          this.isDiving = false;
          this.diveCooldown = 3.5;
          this.vy = -180;
        }
      }
      return;
    }

    // 7. KNIGHT (Shielded Lollipop Soldier)
    if (this.type === 'KNIGHT') {
      this.facing = dirToPlayer;
      this.stabTimer += dt;

      if (distToPlayer < 140 && this.stabTimer >= 3.2) {
        this.isStabbing = true;
        this.stabTimer = 0;
        this.vx = this.facing * 160;
      } else if (this.isStabbing) {
        if (this.stabTimer > 0.45) {
          this.isStabbing = false;
          this.vx = 0;
        }
      } else {
        const inSight = distToPlayer < 400;
        if (inSight) {
          if (this.isGrounded && this.checkCliffAhead(platforms)) {
            this.vx = 0;
          } else {
            this.vx = this.facing * this.speed;
          }
        } else {
          if (this.isGrounded && this.checkCliffAhead(platforms)) {
            this.patrolDir = -this.patrolDir;
            this.facing = this.patrolDir;
          }
          this.vx = this.patrolDir * this.speed;
        }
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 8. LATIGO (Licorice Whip Soldier)
    if (this.type === 'LATIGO') {
      this.facing = dirToPlayer;
      const inWhipRange = distToPlayer < 160 && Math.abs(player.y - this.y) < 70;

      if (this.whipState === 'PATROL') {
        const inSight = distToPlayer < 380;
        if (inSight) {
          if (this.isGrounded && this.checkCliffAhead(platforms)) {
            this.vx = 0;
          } else {
            this.vx = dirToPlayer * this.speed;
          }
        } else {
          if (this.isGrounded && this.checkCliffAhead(platforms)) {
            this.patrolDir = -this.patrolDir;
            this.facing = this.patrolDir;
          }
          this.vx = this.patrolDir * this.speed;
        }

        if (inWhipRange) {
          this.whipState = 'TELEGRAPH';
          this.whipTimer = 0.42; // 0.42s winding whip back
          this.vx = 0;
        }
      } else if (this.whipState === 'TELEGRAPH') {
        this.vx = 0;
        this.whipTimer -= dt;
        if (this.whipTimer <= 0) {
          this.whipState = 'WHIP';
          this.whipTimer = 0.22;
          // Whip strike check
          if (distToPlayer < 160 && player && !player.isDead) {
            player.takeDamage(1, this.x, particles, soundManager, camera);
          }
          if (particles) {
            particles.emitSparkles(this.x + (this.facing === -1 ? -40 : this.width + 40), this.y + 24, 8, '#A3E635');
          }
        }
      } else if (this.whipState === 'WHIP') {
        this.whipTimer -= dt;
        if (this.whipTimer <= 0) {
          this.whipState = 'RECOVER';
          this.whipTimer = 0.85; // 0.85s recovery cooldown
        }
      } else if (this.whipState === 'RECOVER') {
        this.vx = 0;
        this.whipTimer -= dt;
        if (this.whipTimer <= 0) {
          this.whipState = 'PATROL';
        }
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 9. ACIDO (Flying Acid Fish with Syrup Bombs)
    if (this.type === 'ACIDO') {
      this.facing = dirToPlayer;
      this.x -= 55 * dt;
      this.y = this.hoverY + Math.sin(this.animTime * this.waveSpeed) * this.waveAmp;
      this.rotation = Math.sin(this.animTime * 4) * 0.12;

      this.spitTimer += dt;
      if (this.spitTimer >= this.spitInterval) {
        this.spitTimer = 0;
        if (distToPlayer < 500) {
          const muzzleX = this.x + this.width / 2;
          const muzzleY = this.y + this.height / 2;
          const angle = Math.atan2(player.y - muzzleY, player.x - muzzleX);

          enemyProjectiles.push(
            new Projectile({
              x: muzzleX,
              y: muzzleY,
              vx: Math.cos(angle) * 260,
              vy: Math.sin(angle) * 260,
              type: 'ACID_DROP',
              damage: 1,
              isPlayer: false
            })
          );
          if (particles) {
            particles.emitSugarSmoke(muzzleX, muzzleY, 4, '#84CC16');
          }
        }
      }
      return;
    }

    // 7. RANA (Gummy Frog)
    if (this.type === 'RANA') {
      this.facing = dirToPlayer;
      if (this.frogState === 'CROUCH') {
        this.vx = 0;
        this.frogTimer -= dt;
        if (this.frogTimer <= 0) {
          this.frogState = 'JUMPING';
          this.vy = -480;
          this.vx = dirToPlayer * 170;
          this.isGrounded = false;
          if (soundManager && soundManager.playEnemyJump) soundManager.playEnemyJump();
          if (particles) particles.emitSodaBubbles(this.x + this.width / 2, this.y + this.height, 4);
        }
      } else if (this.frogState === 'JUMPING') {
        if (this.isGrounded && this.vy >= 0) {
          this.frogState = 'CROUCH';
          this.frogTimer = 0.85;
          this.vx = 0;
          if (particles) particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height, 8, '#10B981');

          // Spits soda bubble on landing if player is in sight
          if (distToPlayer < 480) {
            enemyProjectiles.push(
              new Projectile({
                x: this.x + (this.facing === 1 ? this.width : 0),
                y: this.y + 16,
                vx: dirToPlayer * 220,
                vy: -80,
                type: 'BUBBLE',
                damage: 1,
                isPlayer: false
              })
            );
          }
        }
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 8. ANGUILA (Electric Eel)
    if (this.type === 'ANGUILA') {
      this.facing = dirToPlayer;
      if (this.eelState === 'SUBMERGED') {
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0;
        this.y = this.baseY + 25; // hidden under tide
        if (distToPlayer < 300) {
          this.eelState = 'SURGE';
          this.vy = -340;
          this.gravity = 500;
          if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
          if (particles) particles.emitSodaBubbles(this.x + this.width / 2, this.baseY, 12);
        }
      } else if (this.eelState === 'SURGE') {
        if (this.vy >= 0) {
          this.eelState = 'DISCHARGE';
          this.eelTimer = 0.6;
          this.vy = 0;
          this.gravity = 0;
          // Fire electric bolts diagonally
          [-1, 1].forEach(d => {
            enemyProjectiles.push(
              new Projectile({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: d * 200,
                vy: 60,
                type: 'EEL_BOLT',
                damage: 1,
                isPlayer: false
              })
            );
          });
          if (particles) particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 12, '#FDE047');
        }
      } else if (this.eelState === 'DISCHARGE') {
        this.eelTimer -= dt;
        if (this.eelTimer <= 0) {
          this.eelState = 'DIVE';
          this.vy = 220;
          this.gravity = 400;
        }
      } else if (this.eelState === 'DIVE') {
        if (this.y >= this.baseY + 20) {
          this.eelState = 'SUBMERGED';
          this.y = this.baseY + 25;
          this.vy = 0;
          this.gravity = 0;
        }
      }

      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      return;
    }

    // 9. PINGUINO (Sliding Penguin)
    if (this.type === 'PINGUINO') {
      this.facing = dirToPlayer;
      this.vx = dirToPlayer * this.speed;

      if (particles && Math.random() < 0.3) {
        particles.emitSparkles(this.x + this.width / 2, this.y + this.height, 2, '#38BDF8');
      }

      this.shootTimer += dt;
      if (this.shootTimer >= 1.8 && distToPlayer < 450) {
        this.shootTimer = 0;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + (this.facing === 1 ? this.width : 0),
            y: this.y + this.height / 2,
            vx: dirToPlayer * 280,
            vy: -40,
            type: 'ICE_SHARD',
            damage: 1,
            isPlayer: false
          })
        );
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 10. YETI (Sugar Cotton Yeti)
    if (this.type === 'YETI') {
      this.facing = dirToPlayer;

      if (this.slamState === 'WALK') {
        this.vx = dirToPlayer * this.speed;
        this.slamTimer -= dt;
        if (this.slamTimer <= 0 && distToPlayer < 350) {
          this.slamState = 'PREPARE';
          this.slamTimer = 0.5;
          this.vx = 0;
          this.vy = -260;
          this.isGrounded = false;
        }
      } else if (this.slamState === 'PREPARE') {
        if (this.isGrounded && this.vy >= 0) {
          this.slamState = 'SLAM';
          this.slamTimer = 0.6;
          if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
          if (particles) {
            particles.emitShockwave(this.x + this.width / 2, this.y + this.height, 60, '#38BDF8');
            particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height, 8, '#BAE6FD');
          }

          // Launch snowballs in both directions
          [-1, 1].forEach(dir => {
            enemyProjectiles.push(
              new Projectile({
                x: this.x + this.width / 2,
                y: this.y + this.height - 10,
                vx: dir * 220,
                vy: -80,
                type: 'SNOWBALL',
                damage: 1,
                isPlayer: false
              })
            );
          });
        }
      } else if (this.slamState === 'SLAM') {
        this.vx = 0;
        this.slamTimer -= dt;
        if (this.slamTimer <= 0) {
          this.slamState = 'WALK';
          this.slamTimer = 2.4;
        }
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 11. MURCIELAGO (Gummy Bat)
    if (this.type === 'MURCIELAGO') {
      this.facing = dirToPlayer;
      if (this.batState === 'ROOST') {
        this.vx = 0;
        this.vy = 0;
        if (distToPlayer < 320) {
          this.batState = 'SWOOP';
          this.batTimer = 0;
        }
      } else if (this.batState === 'SWOOP') {
        this.batTimer += dt;
        this.x += dirToPlayer * 140 * dt;
        this.y = this.hoverY + Math.sin(this.batTimer * 5) * 65;

        this.shootTimer += dt;
        if (this.shootTimer >= 1.8 && distToPlayer < 400) {
          this.shootTimer = 0;
          enemyProjectiles.push(
            new Projectile({
              x: this.x + this.width / 2,
              y: this.y + this.height / 2,
              vx: dirToPlayer * 240,
              vy: 0,
              type: 'SONIC_WAVE',
              damage: 1,
              isPlayer: false
            })
          );
        }
      }
      return;
    }

    // 12. SLIME (Acid Gummy Slime)
    if (this.type === 'SLIME') {
      this.facing = dirToPlayer;
      if (this.isGrounded && this.checkCliffAhead(platforms)) {
        this.vx = 0;
      } else {
        this.vx = dirToPlayer * this.speed;
      }

      this.spitTimer += dt;
      if (this.spitTimer >= 2.2 && distToPlayer < 420) {
        this.spitTimer = 0;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + this.width / 2,
            y: this.y + 10,
            vx: dirToPlayer * 160,
            vy: -220,
            type: 'JELLY_SPLASH',
            damage: 1,
            isPlayer: false
          })
        );
        if (particles) particles.emitSodaBubbles(this.x + this.width / 2, this.y, 5);
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 13. SALAMANDRA (Fiery Caramel Salamander)
    if (this.type === 'SALAMANDRA') {
      this.facing = dirToPlayer;
      if (this.isGrounded && this.checkCliffAhead(platforms)) {
        this.vx = 0;
      } else {
        this.vx = dirToPlayer * this.speed;
      }

      this.fireTimer += dt;
      if (this.fireTimer >= 1.9 && distToPlayer < 400) {
        this.fireTimer = 0;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + this.width / 2 + this.facing * 18,
            y: this.y + 12,
            vx: dirToPlayer * 220,
            vy: -100,
            type: 'FIRE_BALL',
            damage: 1,
            isPlayer: false
          })
        );
        if (particles) particles.emitSugarSmoke(this.x + this.width / 2, this.y + 12, 4, '#EA580C');
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 14. AVISPA_FUEGO (Burnt Sugar Fire Wasp)
    if (this.type === 'AVISPA_FUEGO') {
      this.facing = dirToPlayer;
      this.x += dirToPlayer * 60 * dt;
      this.y = this.hoverY + Math.sin(this.animTime * 4) * 45;

      this.shootTimer += dt;
      if (this.shootTimer >= 2.0 && distToPlayer < 440) {
        this.shootTimer = 0;
        [-0.2, 0, 0.2].forEach(offset => {
          const angle = Math.atan2(pCenterY - (this.y + 20), pCenterX - (this.x + 20)) + offset;
          enemyProjectiles.push(
            new Projectile({
              x: this.x + this.width / 2,
              y: this.y + this.height / 2,
              vx: Math.cos(angle) * 230,
              vy: Math.sin(angle) * 230,
              type: 'FIRE_STINGER',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (particles) particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 6, '#F59E0B');
      }
      return;
    }

    // 15. GARGOYLA (Dark Chocolate Gargoyle)
    if (this.type === 'GARGOYLA') {
      this.facing = dirToPlayer;
      this.x += dirToPlayer * 50 * dt;
      this.y = this.hoverY + Math.sin(this.animTime * 3) * 50;

      this.shootTimer += dt;
      if (this.shootTimer >= 2.2 && distToPlayer < 450) {
        this.shootTimer = 0;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: dirToPlayer * 240,
            vy: 0,
            type: 'PLASMA_ORB',
            damage: 1,
            isPlayer: false
          })
        );
        if (particles) particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 8, '#9333EA');
      }
      return;
    }

    // 16. GUARDIA_REAL (Royal Candy Guard with Lance & Shield)
    if (this.type === 'GUARDIA_REAL') {
      this.facing = dirToPlayer;
      if (this.isGrounded && this.checkCliffAhead(platforms)) {
        this.vx = 0;
      } else {
        this.vx = dirToPlayer * this.speed;
      }

      this.thrustTimer += dt;
      if (this.thrustTimer >= 2.4 && distToPlayer < 380) {
        this.thrustTimer = 0;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + this.width / 2 + this.facing * 20,
            y: this.y + 24,
            vx: this.facing * 280,
            vy: 0,
            type: 'LANCE_THRUST',
            damage: 1,
            isPlayer: false
          })
        );
        if (particles) particles.emitSparkles(this.x + this.width / 2, this.y + 24, 6, '#E11D48');
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 17. HECHICERO_DULCE (Dark Candy Sorcerer)
    if (this.type === 'HECHICERO_DULCE') {
      this.facing = dirToPlayer;
      this.x += dirToPlayer * 50 * dt;
      this.y = this.hoverY + Math.sin(this.animTime * 3) * 45;

      this.castTimer += dt;
      if (this.castTimer >= 2.0 && distToPlayer < 460) {
        this.castTimer = 0;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: dirToPlayer * 250,
            vy: 0,
            type: 'RUNE_BLAST',
            damage: 1,
            isPlayer: false
          })
        );
        if (particles) particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 8, '#F59E0B');
      }
      return;
    }

    // 8. DEFAULT GUMMY SOLDIER
    const inSight = distToPlayer < 440;

    if (inSight) {
      this.facing = dirToPlayer;
      this.vx = 0;

      if (this.isAiming) {
        this.aimTimer -= dt;
        if (this.aimTimer <= 0) {
          this.isAiming = false;
          this.burstRemaining = 2;
          this.burstTimer = 0;
          this.fireBullet(enemyProjectiles, particles);
          this.burstRemaining--;
        }
      } else if (this.burstRemaining > 0) {
        this.burstTimer += dt;
        if (this.burstTimer >= 0.16) {
          this.burstTimer = 0;
          this.burstRemaining--;
          this.fireBullet(enemyProjectiles, particles);
        }
      } else {
        this.shootTimer += dt;
        if (this.shootTimer >= this.shootInterval) {
          this.shootTimer = 0;
          this.isAiming = true;
          this.aimTimer = this.aimTelegraphDuration;
          if (particles) particles.emitSparkles(this.x + (this.facing === 1 ? this.width : 0), this.y + 22, 3, '#F43F5E');
        }
      }
    } else {
      this.facing = this.patrolDir;
      if (this.isGrounded && this.checkCliffAhead(platforms)) {
        this.patrolDir = -this.patrolDir;
        this.facing = this.patrolDir;
      }
      this.vx = this.patrolDir * this.speed;
      if (this.x < 100) this.patrolDir = 1;
    }

    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.isGrounded = false;
    Physics.resolvePlatforms(this, platforms);
  }

  fireBullet(enemyProjectiles, particles) {
    const muzzleX = this.x + (this.facing === -1 ? 6 : this.width - 6);
    const muzzleY = this.y + 30;

    enemyProjectiles.push(
      new Projectile({
        x: muzzleX,
        y: muzzleY,
        vx: this.facing * 310,
        vy: (Math.random() - 0.5) * 30,
        type: 'ENEMY_BULLET',
        damage: 1,
        isPlayer: false
      })
    );

    if (particles) {
      particles.emitSugarSmoke(muzzleX, muzzleY, 4, '#FCA5A5');
    }
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // Dynamic Grounded Shadow (Grounded Contact & Cast Shadows)
    const groundY = this.groundY || 460;
    const distToGround = Math.max(0, groundY - bottomY);
    const maxDist = 340;
    if (distToGround < maxDist && this.type !== 'PEZ') {
      const shadowFactor = 1 - (distToGround / maxDist);
      const isFlying = (this.type === 'DRONE' || this.type === 'GLOBO' || this.type === 'MOTH' || this.type === 'MURCIELAGO' || this.type === 'AVISPA_FUEGO');
      const baseAlpha = this.isGrounded ? 0.38 : (isFlying ? (0.06 + 0.18 * shadowFactor) : (0.10 + 0.26 * shadowFactor));
      const shadowW = (this.width * 0.48) * (this.isGrounded ? 1.0 : (0.85 + 0.35 * (1 - shadowFactor)));
      const shadowH = (isFlying ? 4.2 : 5.8) * (this.isGrounded ? 1.0 : (0.75 + 0.25 * (1 - shadowFactor)));

      ctx.save();
      // Outer diffuse shadow
      ctx.beginPath();
      ctx.ellipse(cx, groundY + 1, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${baseAlpha})`;
      ctx.fill();

      // Sharp dark contact occlusion pill directly under soles when on ground
      if (this.isGrounded && distToGround < 4) {
        ctx.beginPath();
        ctx.ellipse(cx, groundY, shadowW * 0.72, 2.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.fill();
      }
      ctx.restore();
    }

    // --- 1. PEZ SPRITE ---
    if (this.type === 'PEZ') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.rotate(this.rotation);
      ctx.scale(this.facing, 1);

      const pezSprite = imageLoader.getImage('pez');
      const renderW = 64;
      const renderH = 52;

      if (pezSprite && pezSprite.complete && pezSprite.naturalWidth > 0) {
        ctx.drawImage(pezSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#06B6D4';
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // --- 2. GLOBO / DRONE SPRITE ---
    if (this.type === 'DRONE' || this.type === 'GLOBO') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.rotate(this.rotation);

      const globoSprite = imageLoader.getImage('globo');
      const renderW = 60;
      const renderH = 68;

      if (globoSprite && globoSprite.complete && globoSprite.naturalWidth > 0) {
        ctx.drawImage(globoSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.arc(0, -6, 24, 0, Math.PI * 2);
        ctx.fillStyle = '#EC4899';
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // --- 3. ROLLER SPRITE (LIME JELLY ROLLER WITH SSS & WET GLOSS) ---
    if (this.type === 'ROLLER') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.rotate(this.rotation);

      const rollerSprite = imageLoader.getImage('roller');
      const renderW = 62;
      const renderH = 62;

      // 1. SSS Emerald Backlight Glow
      ctx.save();
      ctx.shadowColor = 'rgba(74, 222, 128, 0.70)';
      ctx.shadowBlur = 10;

      if (rollerSprite && rollerSprite.complete && rollerSprite.naturalWidth > 0) {
        ctx.drawImage(rollerSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        const rollGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 28);
        rollGrad.addColorStop(0, '#BBF7D0');
        rollGrad.addColorStop(0.35, '#22C55E');
        rollGrad.addColorStop(0.8, '#15803D');
        rollGrad.addColorStop(1, '#052E16');
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fillStyle = rollGrad;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();

      // 2. SSS Internal Lime Diffusion Core
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.50;
      const sssRoll = ctx.createRadialGradient(-4, -4, 1, 0, 0, 20);
      sssRoll.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sssRoll.addColorStop(0.6, 'rgba(74, 222, 128, 0.5)');
      sssRoll.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = sssRoll;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Hard Wet Lacquer Specular Crescent Reflection
      ctx.save();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, -Math.PI * 0.85, -Math.PI * 0.25);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-10, -10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
      return;
    }

    // --- 4. SNIPER SPRITE ---
    if (this.type === 'SNIPER') {
      // Draw Laser Aiming Sight
      if (this.isAimingLaser) {
        ctx.save();
        ctx.beginPath();
        const startLaserX = cx + (this.facing === -1 ? -16 : 16);
        const startLaserY = this.y + 30;
        ctx.moveTo(startLaserX, startLaserY);
        ctx.lineTo(this.laserTargetX, this.laserTargetY);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();

        // Laser dot at target
        ctx.beginPath();
        ctx.arc(this.laserTargetX, this.laserTargetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.restore();
      }

      ctx.translate(cx, bottomY);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const sniperSprite = imageLoader.getImage('sniper');
      const renderW = 60;
      const renderH = 72;

      if (sniperSprite && sniperSprite.complete && sniperSprite.naturalWidth > 0) {
        ctx.drawImage(sniperSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.roundRect(-renderW / 2 + 6, -renderH, renderW - 12, renderH, 8);
        ctx.fillStyle = '#38BDF8';
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // --- 5. MOTH SPRITE ---
    if (this.type === 'MOTH') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.rotate(this.rotation);
      ctx.scale(this.facing, 1 + Math.sin(this.animTime * 14) * 0.12);

      const mothSprite = imageLoader.getImage('moth');
      const renderW = 70;
      const renderH = 60;

      if (mothSprite && mothSprite.complete && mothSprite.naturalWidth > 0) {
        ctx.drawImage(mothSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#F472B6';
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // --- 6. KNIGHT SPRITE ---
    if (this.type === 'KNIGHT') {
      ctx.translate(cx, bottomY);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      const stabOffset = this.isStabbing ? this.facing * 10 : 0;
      ctx.scale(this.facing, 1);

      const knightSprite = imageLoader.getImage('knight');
      const renderW = 68;
      const renderH = 78;

      if (knightSprite && knightSprite.complete && knightSprite.naturalWidth > 0) {
        ctx.drawImage(knightSprite, -renderW / 2 + stabOffset, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.roundRect(-renderW / 2 + 8, -renderH, renderW - 16, renderH, 8);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // --- 7. LATIGO SPRITE ---
    if (this.type === 'LATIGO') {
      ctx.translate(cx, bottomY + 1);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const latigoSprite = imageLoader.getImage('latigo');
      const renderW = 62;
      const renderH = 72;

      if (latigoSprite && latigoSprite.complete && latigoSprite.naturalWidth > 0) {
        ctx.drawImage(latigoSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.roundRect(-renderW / 2 + 8, -renderH, renderW - 16, renderH, 8);
        ctx.fillStyle = '#1E1B4B';
        ctx.fill();
      }

      // Whip lash visual arc effect during WHIP state
      if (this.whipState === 'WHIP') {
        ctx.beginPath();
        ctx.arc(renderW / 2 + 12, -renderH / 2, 54, -Math.PI / 4, Math.PI / 4);
        ctx.strokeStyle = '#A3E635';
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      ctx.restore();
      return;
    }

    // --- 8. ACIDO SPRITE ---
    if (this.type === 'ACIDO') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.rotate(this.rotation);
      ctx.scale(this.facing, 1);

      const acidoSprite = imageLoader.getImage('acido');
      const renderW = 64;
      const renderH = 56;

      if (acidoSprite && acidoSprite.complete && acidoSprite.naturalWidth > 0) {
        ctx.drawImage(acidoSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#84CC16';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 9. RANA SPRITE ---
    if (this.type === 'RANA') {
      let scaleX = this.frogState === 'CROUCH' ? 1.15 : 0.9;
      let scaleY = this.frogState === 'CROUCH' ? 0.85 : 1.12;

      ctx.translate(cx, bottomY + 1);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing * scaleX, scaleY);

      const ranaSprite = imageLoader.getImage('rana');
      const renderW = 62;
      const renderH = 60;

      if (ranaSprite && ranaSprite.complete && ranaSprite.naturalWidth > 0) {
        ctx.drawImage(ranaSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, -renderH / 2, 26, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 10. ANGUILA SPRITE ---
    if (this.type === 'ANGUILA') {
      if (this.eelState === 'SUBMERGED') {
        // Sparkling bubbles when submerged
        ctx.beginPath();
        ctx.ellipse(cx, this.baseY, 22, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fill();
        ctx.restore();
        return;
      }

      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const angSprite = imageLoader.getImage('anguila');
      const renderW = 74;
      const renderH = 54;

      if (angSprite && angSprite.complete && angSprite.naturalWidth > 0) {
        ctx.drawImage(angSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#06B6D4';
        ctx.fill();
      }

      // Electric spark corona in discharge state
      if (this.eelState === 'DISCHARGE') {
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.restore();
      return;
    }

    // --- 11. PINGUINO SPRITE ---
    if (this.type === 'PINGUINO') {
      ctx.translate(cx, bottomY + 1);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const pingSprite = imageLoader.getImage('pinguino');
      const renderW = 66;
      const renderH = 50;

      if (pingSprite && pingSprite.complete && pingSprite.naturalWidth > 0) {
        ctx.drawImage(pingSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, -renderH / 2, 28, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0F172A';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 12. YETI SPRITE ---
    if (this.type === 'YETI') {
      let scaleX = this.slamState === 'PREPARE' ? 0.85 : 1;
      let scaleY = this.slamState === 'PREPARE' ? 1.2 : 1;

      ctx.translate(cx, bottomY + 1);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing * scaleX, scaleY);

      const yetiSprite = imageLoader.getImage('yeti');
      const renderW = 88;
      const renderH = 92;

      if (yetiSprite && yetiSprite.complete && yetiSprite.naturalWidth > 0) {
        ctx.drawImage(yetiSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, -renderH / 2, 38, 38, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#E0F2FE';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 13. MURCIELAGO SPRITE ---
    if (this.type === 'MURCIELAGO') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const batSprite = imageLoader.getImage('murcielago');
      const renderW = 64;
      const renderH = 56;

      if (batSprite && batSprite.complete && batSprite.naturalWidth > 0) {
        ctx.drawImage(batSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#9333EA';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 14. SLIME SPRITE ---
    if (this.type === 'SLIME') {
      const isWalking = Math.abs(this.vx) > 5;
      let scaleX = isWalking ? (1 + Math.sin(this.animTime * 8) * 0.12) : 1;
      let scaleY = isWalking ? (1 - Math.sin(this.animTime * 8) * 0.12) : 1;

      ctx.translate(cx, bottomY + 1);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing * scaleX, scaleY);

      const slimeSprite = imageLoader.getImage('slime');
      const renderW = 66;
      const renderH = 50;

      if (slimeSprite && slimeSprite.complete && slimeSprite.naturalWidth > 0) {
        ctx.drawImage(slimeSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, -renderH / 2, 28, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#84CC16';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 15. SALAMANDRA SPRITE ---
    if (this.type === 'SALAMANDRA') {
      ctx.translate(cx, bottomY + 1);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const salSprite = imageLoader.getImage('salamandra');
      const renderW = 74;
      const renderH = 50;

      if (salSprite && salSprite.complete && salSprite.naturalWidth > 0) {
        ctx.drawImage(salSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, -renderH / 2, 32, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#EA580C';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 16. AVISPA_FUEGO SPRITE ---
    if (this.type === 'AVISPA_FUEGO') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const waspSprite = imageLoader.getImage('avispa');
      const renderW = 64;
      const renderH = 56;

      if (waspSprite && waspSprite.complete && waspSprite.naturalWidth > 0) {
        ctx.drawImage(waspSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 17. GARGOYLA SPRITE ---
    if (this.type === 'GARGOYLA') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const garSprite = imageLoader.getImage('gargola');
      const renderW = 72;
      const renderH = 66;

      if (garSprite && garSprite.complete && garSprite.naturalWidth > 0) {
        ctx.drawImage(garSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 24, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#27272A';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 18. GUARDIA_REAL SPRITE ---
    if (this.type === 'GUARDIA_REAL') {
      ctx.translate(cx, bottomY + 1);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const guardSprite = imageLoader.getImage('guardia_real');
      const renderW = 74;
      const renderH = 84;

      if (guardSprite && guardSprite.complete && guardSprite.naturalWidth > 0) {
        ctx.drawImage(guardSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, -renderH / 2, 32, 36, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#27272A';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 19. HECHICERO_DULCE SPRITE ---
    if (this.type === 'HECHICERO_DULCE') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.6) drop-shadow(0 0 6px rgba(255,255,255,0.85))';
      ctx.scale(this.facing, 1);

      const sorSprite = imageLoader.getImage('hechicero');
      const renderW = 68;
      const renderH = 74;

      if (sorSprite && sorSprite.complete && sorSprite.naturalWidth > 0) {
        ctx.drawImage(sorSprite, -renderW / 2, -renderH / 2, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 30, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#581C87';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // --- 9. TURRET SPRITE ---
    if (this.type === 'TURRET') {
      ctx.translate(cx, this.y + this.height / 2);
      ctx.beginPath();
      ctx.roundRect(-26, 8, 52, 20, [5, 5, 0, 0]);
      ctx.fillStyle = '#78350F';
      ctx.fill();
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(0, 4);
      ctx.rotate(this.aimAngle);

      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(10, -6, 20, 12);
      ctx.strokeStyle = '#94A3B8';
      ctx.strokeRect(10, -6, 20, 12);

      const sphereGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 20);
      sphereGrad.addColorStop(0, '#FFFFFF');
      sphereGrad.addColorStop(0.3, '#E0F2FE');
      sphereGrad.addColorStop(1, '#38BDF8');

      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      return;
    }

    // --- 8. GUMMY BEAR SOLDIER WITH SUBSURFACE SCATTERING & WET LACQUER ---
    const isWalking = Math.abs(this.vx) > 5;
    const bounceY = (isWalking && this.isGrounded) ? Math.abs(Math.sin(this.animTime * 12)) * 3 : 0;

    let scaleX = isWalking ? (1 + Math.sin(this.animTime * 12) * 0.06) : (1 - Math.sin(this.animTime * 3) * 0.03);
    let scaleY = isWalking ? (1 - Math.sin(this.animTime * 12) * 0.06) : (1 + Math.sin(this.animTime * 3) * 0.03);

    if (this.hitWobble > 0) {
      const wobble = Math.sin(this.wobblePhase) * this.hitWobble;
      scaleX += wobble;
      scaleY -= wobble;
    }

    // Thematic Death Deformations (Melt Collapsing vs Frozen Crystalline Shiver)
    if (this.isStumbling && this.deathType === 'MELT') {
      scaleY *= Math.max(0.08, 1 - this.meltProgress * 0.92);
      scaleX *= (1 + this.meltProgress * 1.5);
    }

    // Anchored firmly on ground
    ctx.translate(cx, bottomY + 1 - bounceY);

    if (this.isStumbling && this.deathType === 'SHATTER') {
      ctx.filter = 'brightness(2.2) saturate(1.8) hue-rotate(180deg)';
    } else if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.5) contrast(1.4)';
    }

    ctx.scale(this.facing * scaleX, scaleY);

    const renderH = 64;
    const renderW = 52;
    const aimOffset = (this.isAiming || this.burstRemaining > 0) ? -3 : 0;

    this.drawGummyBearSSS(ctx, renderW, renderH, aimOffset);

    // Aiming laser guide line / warning indicator
    if (this.isAiming) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(18, -30);
      ctx.lineTo(100, -30);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Muzzle glint
      ctx.beginPath();
      ctx.arc(18, -30, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FB7185';
      ctx.fill();
      ctx.restore();
    }

    // Comical Dizzy Stars over head when stumbling before defeat
    if (this.isStumbling && (!this.deathType || this.deathType === 'STUMBLE')) {
      ctx.save();
      const starRadius = 20;
      for (let s = 0; s < 3; s++) {
        const starAngle = this.animTime * 9 + (s * Math.PI * 2 / 3);
        const starX = Math.cos(starAngle) * starRadius;
        const starY = -renderH - 12 + Math.sin(starAngle) * 5;
        ctx.fillStyle = '#FEF08A';
        ctx.font = '900 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦', starX, starY);
      }
      ctx.restore();
    }

    // Frozen Ice Spikes Glaze when shattering
    if (this.isStumbling && this.deathType === 'SHATTER') {
      ctx.save();
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-16, -renderH * 0.8);
      ctx.lineTo(-24, -renderH * 0.9);
      ctx.lineTo(-12, -renderH * 0.6);
      ctx.moveTo(16, -renderH * 0.8);
      ctx.lineTo(24, -renderH * 0.9);
      ctx.lineTo(12, -renderH * 0.6);
      ctx.stroke();
      ctx.restore();
    }

    // Boiling Syrup Puddle Base when melting
    if (this.isStumbling && this.deathType === 'MELT') {
      ctx.save();
      const pW = (renderW * 0.9) * (1 + this.meltProgress * 1.2);
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.ellipse(0, 0, pW, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FDA4AF';
      ctx.beginPath();
      ctx.ellipse(-pW * 0.3, -2, pW * 0.35, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // --- SUBSURFACE SCATTERING (SSS) & DYNAMIC SPRITE POSES ---
  drawGummyBearSSS(ctx, renderW, renderH, aimOffset) {
    const isWalking = Math.abs(this.vx) > 5;
    let spriteKey = 'gummybear';
    let currentRenderW = renderW;

    if (this.hurtTimer > 0 || this.isStumbling) {
      spriteKey = 'gummybear_hurt';
      currentRenderW = renderW * 1.08;
    } else if (this.isAiming || this.burstRemaining > 0) {
      spriteKey = 'gummybear_shoot';
      currentRenderW = renderW * 1.15;
    } else if (isWalking) {
      // 2-frame walking cycle alternating foot steps
      const walkFrame = Math.sin(this.animTime * 10) > 0;
      spriteKey = walkFrame ? 'gummybear_walk' : 'gummybear';
    }

    const gummySprite = imageLoader.getImage(spriteKey) || imageLoader.getImage('gummybear');
    const ox = aimOffset;

    // 1. Gummy Sprite Rendering with Translucent Backlight Glow
    if (gummySprite && gummySprite.complete && gummySprite.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 45, 110, 0.65)';
      ctx.shadowBlur = 8;
      ctx.drawImage(gummySprite, -currentRenderW / 2 + ox, -renderH, currentRenderW, renderH);
      ctx.restore();
      return;
    }

    // Procedural Volumetric Translucent Gummy Body Fallback (When sprite is not loaded)
    ctx.save();
    ctx.shadowColor = 'rgba(255, 45, 110, 0.75)';
    ctx.shadowBlur = 12;

    // 2. INTERNAL SUBSURFACE SCATTERING GLOW CORE (Volumetric Light Diffusion)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.58;

    // Belly Internal Lantern Glow
    const sssBelly = ctx.createRadialGradient(-3 + ox, -renderH + 42, 1, ox, -renderH + 42, 20);
    sssBelly.addColorStop(0, 'rgba(255, 200, 220, 0.95)');
    sssBelly.addColorStop(0.45, 'rgba(255, 60, 110, 0.65)');
    sssBelly.addColorStop(1, 'rgba(255, 0, 60, 0)');
    ctx.fillStyle = sssBelly;
    ctx.beginPath();
    ctx.ellipse(ox, -renderH + 42, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head / Muzzle Internal SSS Glow
    const sssHead = ctx.createRadialGradient(ox, -renderH + 20, 1, ox, -renderH + 20, 14);
    sssHead.addColorStop(0, 'rgba(255, 220, 230, 0.90)');
    sssHead.addColorStop(0.5, 'rgba(255, 75, 120, 0.50)');
    sssHead.addColorStop(1, 'rgba(255, 0, 80, 0)');
    ctx.fillStyle = sssHead;
    ctx.beginPath();
    ctx.ellipse(ox, -renderH + 20, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ear translucency (Backlight edge diffusion)
    const earSSS = ctx.createRadialGradient(-16 + ox, -renderH + 8, 1, -16 + ox, -renderH + 8, 7);
    earSSS.addColorStop(0, 'rgba(255, 230, 240, 0.85)');
    earSSS.addColorStop(0.7, 'rgba(255, 50, 100, 0.45)');
    earSSS.addColorStop(1, 'rgba(255, 0, 50, 0)');
    ctx.fillStyle = earSSS;
    ctx.beginPath();
    ctx.arc(-16 + ox, -renderH + 8, 6.5, 0, Math.PI * 2);
    ctx.arc(16 + ox, -renderH + 8, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. HARD SPECULAR HIGHLIGHTS (WET / VARNISHED JELLY GLOSS - Brillos Especulares Duros)
    ctx.save();
    ctx.globalAlpha = 0.92;

    // 3a. Sharp Wet Ear Crescent Glints
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-17 + ox, -renderH + 5, 4.5, 2.2, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14 + ox, -renderH + 5, 4.5, 2.2, Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();

    // Secondary micro-sparkle on ear tips
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-14 + ox, -renderH + 11, 1.4, 0, Math.PI * 2);
    ctx.arc(18 + ox, -renderH + 11, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // 3b. Forehead Wet Curved Specular Streak
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-2 + ox, -renderH + 15, 10, -Math.PI * 0.85, -Math.PI * 0.25);
    ctx.stroke();

    // 3c. Snout / Nose Tip Hard High-Gloss Pearl
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-2 + ox, -renderH + 22, 3.2, 2.2, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(3 + ox, -renderH + 24, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 3d. Cheeks & Muzzle Wet Sheen
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-10 + ox, -renderH + 22, 5, -Math.PI * 0.7, -Math.PI * 0.1);
    ctx.stroke();

    // 3e. Big Volumetric Belly Dome Specular Reflection (Lacquered Jelly Gloss)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(-5 + ox, -renderH + 38, 14, -Math.PI * 0.85, -Math.PI * 0.35);
    ctx.stroke();

    // Soft secondary fill under belly specular streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
    ctx.beginPath();
    ctx.ellipse(-7 + ox, -renderH + 42, 6, 3.5, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // 3f. Left & Right Paw / Foot Lacquer Glints
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-14 + ox, -renderH + 34, 3.5, 1.8, -Math.PI / 4, 0, Math.PI * 2); // Left hand
    ctx.ellipse(-15 + ox, -6, 4.2, 2.0, -Math.PI / 6, 0, Math.PI * 2); // Left foot
    ctx.ellipse(12 + ox, -6, 3.5, 1.8, Math.PI / 6, 0, Math.PI * 2); // Right foot
    ctx.fill();

    // 3g. Internal Micro-Caustic Sugar Bubbles (Tiny suspended bubbles catching light)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(6 + ox, -renderH + 36, 1.5, 0, Math.PI * 2);
    ctx.arc(-8 + ox, -renderH + 49, 1.8, 0, Math.PI * 2);
    ctx.arc(8 + ox, -renderH + 46, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
