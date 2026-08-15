import { Projectile } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Enemy {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.prevY = this.y;
    this.type = options.type || 'GUMMY'; // 'GUMMY', 'TURRET', 'DRONE', 'GLOBO', 'PEZ', 'ROLLER', 'SNIPER', 'MOTH', 'KNIGHT'
    this.width = options.width || 40;
    this.height = options.height || 48;
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
    this.shootInterval = options.shootInterval || 2.4;
    this.burstRemaining = 0;
    this.burstTimer = 0;
    this.hurtTimer = 0;
    this.hitWobble = 0;
    this.wobblePhase = 0;
    this.rotation = 0;
    this.animTime = Math.random() * 5;
    this.hoverY = this.y;
    this.speed = options.speed || 60;
    this.patrolDir = -1;

    // Specific enemy type configurations
    if (this.type === 'TURRET') {
      this.gravity = 0;
      this.width = 46;
      this.height = 46;
      this.hp = 45;
      this.scoreValue = 350;
      this.aimAngle = Math.PI;
    } else if (this.type === 'DRONE' || this.type === 'GLOBO') {
      this.gravity = 0;
      this.width = 44;
      this.height = 50;
      this.hp = 25;
      this.scoreValue = 300;
    } else if (this.type === 'PEZ') {
      this.gravity = 0;
      this.width = 46;
      this.height = 38;
      this.hp = 22;
      this.scoreValue = 280;
      this.waveSpeed = 4;
      this.waveAmp = 35;
    } else if (this.type === 'ROLLER') {
      this.gravity = 950;
      this.width = 48;
      this.height = 48;
      this.hp = 35;
      this.scoreValue = 400;
      this.speed = 90;
      this.chargeSpeed = 175;
      this.isCharging = false;
    } else if (this.type === 'SNIPER') {
      this.gravity = 0;
      this.width = 46;
      this.height = 54;
      this.hp = 28;
      this.scoreValue = 450;
      this.aimCycleTimer = 0;
      this.isAimingLaser = false;
      this.laserTargetX = 0;
      this.laserTargetY = 0;
    } else if (this.type === 'MOTH') {
      this.gravity = 0;
      this.width = 50;
      this.height = 44;
      this.hp = 20;
      this.scoreValue = 320;
      this.isDiving = false;
      this.diveCooldown = 0;
      this.waveSpeed = 4.5;
      this.waveAmp = 38;
    } else if (this.type === 'KNIGHT') {
      this.gravity = 950;
      this.width = 50;
      this.height = 56;
      this.hp = 55;
      this.scoreValue = 500;
      this.speed = 45;
      this.shieldUp = true;
      this.stabTimer = 0;
      this.isStabbing = false;
    } else {
      this.type = 'GUMMY';
    }
  }

  takeDamage(amount, particles, soundManager, attackerX = 0) {
    // Knight shield mechanic: blocks frontal projectile damage
    if (this.type === 'KNIGHT' && this.shieldUp && attackerX) {
      const attackingFromFront = (this.facing === -1 && attackerX < this.x + this.width / 2) ||
                                 (this.facing === 1 && attackerX > this.x + this.width / 2);
      if (attackingFromFront) {
        // Shield absorbs most damage and clinks
        soundManager.playEnemyPop();
        if (particles) {
          particles.emitSparkles(this.x + (this.facing === -1 ? 8 : this.width - 8), this.y + 24, 6, '#FBBF24');
          particles.emitCandyShards(this.x + (this.facing === -1 ? 8 : this.width - 8), this.y + 24, 4);
        }
        this.hp -= Math.max(1, Math.floor(amount * 0.2));
        this.hurtTimer = 0.05;
        if (this.hp <= 0) this.die(particles, soundManager);
        return;
      }
    }

    this.hp -= amount;
    this.hurtTimer = 0.08;
    this.hitWobble = 0.18;
    this.wobblePhase = 0;
    soundManager.playEnemyPop();

    if (this.gravity > 0 && attackerX) {
      this.vx = (this.x < attackerX ? -120 : 120);
      this.vy = -100;
    }

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 6);
      particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 5, '#EF4444');
    }

    if (this.hp <= 0) {
      this.die(particles, soundManager);
    }
  }

  die(particles, soundManager) {
    this.dead = true;
    soundManager.playExplosion();
    if (particles) {
      particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 24, '#EF4444');
      particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 20);
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 14);
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 8, '#FCA5A5');
    }
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

    const distToPlayer = player ? Math.hypot(player.x - this.x, player.y - this.y) : 999;
    const dirToPlayer = player && player.x < this.x ? -1 : 1;

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

    // 4. ROLLER (Green Gummy Wheel - Charges & Rolls)
    if (this.type === 'ROLLER') {
      const inSight = distToPlayer < 350 && Math.abs(player.y - this.y) < 120;
      if (inSight) {
        this.isCharging = true;
        this.facing = dirToPlayer;
        this.vx = this.facing * this.chargeSpeed;
      } else {
        this.isCharging = false;
        this.vx = this.patrolDir * this.speed;
        this.facing = this.patrolDir;
      }

      // Continuous rolling rotation
      this.rotation += (this.vx * dt * 0.08);

      if (this.isCharging && particles && Math.random() < 0.3) {
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height - 4, 2, '#86EFAC');
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
          this.vx = this.facing * this.speed;
        } else {
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

    // 8. DEFAULT GUMMY SOLDIER
    const inSight = distToPlayer < 420;

    if (inSight) {
      this.facing = dirToPlayer;
      this.vx = 0;

      if (this.burstRemaining > 0) {
        this.burstTimer += dt;
        if (this.burstTimer >= 0.14) {
          this.burstTimer = 0;
          this.burstRemaining--;
          this.fireBullet(enemyProjectiles, particles);
        }
      } else {
        this.shootTimer += dt;
        if (this.shootTimer >= this.shootInterval) {
          this.shootTimer = 0;
          this.burstRemaining = 2;
          this.burstTimer = 0;
          this.fireBullet(enemyProjectiles, particles);
          this.burstRemaining--;
        }
      }
    } else {
      this.facing = this.patrolDir;
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
    const muzzleX = this.x + (this.facing === -1 ? 4 : this.width - 4);
    const muzzleY = this.y + 22;

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

    // Ground Shadow for non-flying enemies
    if (this.type !== 'PEZ' && this.type !== 'DRONE' && this.type !== 'GLOBO' && this.type !== 'MOTH' && this.type !== 'SNIPER') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, bottomY + 2, 16, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
      ctx.fill();
      ctx.restore();
    }

    // --- 1. PEZ SPRITE ---
    if (this.type === 'PEZ') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.5)';
      ctx.rotate(this.rotation);
      ctx.scale(this.facing, 1);

      const pezSprite = imageLoader.getImage('pez');
      if (pezSprite && pezSprite.complete && pezSprite.naturalWidth > 0) {
        ctx.drawImage(pezSprite, -24, -20, 48, 40);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#06B6D4';
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // --- 2. GLOBO / DRONE SPRITE ---
    if (this.type === 'DRONE' || this.type === 'GLOBO') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.5)';
      ctx.rotate(this.rotation);

      const globoSprite = imageLoader.getImage('globo');
      if (globoSprite && globoSprite.complete && globoSprite.naturalWidth > 0) {
        ctx.drawImage(globoSprite, -22, -26, 44, 52);
      } else {
        ctx.beginPath();
        ctx.arc(0, -6, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#EC4899';
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // --- 3. ROLLER SPRITE ---
    if (this.type === 'ROLLER') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.5)';
      ctx.rotate(this.rotation);

      const rollerSprite = imageLoader.getImage('roller');
      if (rollerSprite && rollerSprite.complete && rollerSprite.naturalWidth > 0) {
        ctx.drawImage(rollerSprite, -24, -24, 48, 48);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#22C55E';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // --- 4. SNIPER SPRITE ---
    if (this.type === 'SNIPER') {
      // Draw Laser Aiming Sight
      if (this.isAimingLaser) {
        ctx.save();
        ctx.beginPath();
        const startLaserX = cx + (this.facing === -1 ? -12 : 12);
        const startLaserY = this.y + 24;
        ctx.moveTo(startLaserX, startLaserY);
        ctx.lineTo(this.laserTargetX, this.laserTargetY);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();

        // Laser dot at target
        ctx.beginPath();
        ctx.arc(this.laserTargetX, this.laserTargetY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.restore();
      }

      ctx.translate(cx, bottomY);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.5)';
      ctx.scale(this.facing, 1);

      const sniperSprite = imageLoader.getImage('sniper');
      if (sniperSprite && sniperSprite.complete && sniperSprite.naturalWidth > 0) {
        ctx.drawImage(sniperSprite, -24, -54, 48, 54);
      } else {
        ctx.beginPath();
        ctx.roundRect(-16, -50, 32, 50, 8);
        ctx.fillStyle = '#38BDF8';
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // --- 5. MOTH SPRITE ---
    if (this.type === 'MOTH') {
      ctx.translate(cx, this.y + this.height / 2);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.5)';
      ctx.rotate(this.rotation);
      ctx.scale(this.facing, 1 + Math.sin(this.animTime * 14) * 0.12);

      const mothSprite = imageLoader.getImage('moth');
      if (mothSprite && mothSprite.complete && mothSprite.naturalWidth > 0) {
        ctx.drawImage(mothSprite, -26, -22, 52, 44);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#F472B6';
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // --- 6. KNIGHT SPRITE ---
    if (this.type === 'KNIGHT') {
      ctx.translate(cx, bottomY);
      if (this.hurtTimer > 0) ctx.filter = 'brightness(2.5)';
      const stabOffset = this.isStabbing ? this.facing * 8 : 0;
      ctx.scale(this.facing, 1);

      const knightSprite = imageLoader.getImage('knight');
      if (knightSprite && knightSprite.complete && knightSprite.naturalWidth > 0) {
        ctx.drawImage(knightSprite, -26 + stabOffset, -56, 52, 56);
      } else {
        ctx.beginPath();
        ctx.roundRect(-18, -54, 36, 54, 8);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // --- 7. TURRET SPRITE ---
    if (this.type === 'TURRET') {
      ctx.translate(cx, this.y + this.height / 2);
      ctx.beginPath();
      ctx.roundRect(-20, 6, 40, 16, [4, 4, 0, 0]);
      ctx.fillStyle = '#78350F';
      ctx.fill();
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(0, 4);
      ctx.rotate(this.aimAngle);

      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(8, -5, 16, 10);
      ctx.strokeStyle = '#94A3B8';
      ctx.strokeRect(8, -5, 16, 10);

      const sphereGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
      sphereGrad.addColorStop(0, '#FFFFFF');
      sphereGrad.addColorStop(0.3, '#E0F2FE');
      sphereGrad.addColorStop(1, '#38BDF8');

      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      return;
    }

    // --- 8. GUMMY BEAR SOLDIER ---
    const isWalking = Math.abs(this.vx) > 5;
    const bounceY = (isWalking && this.isGrounded) ? Math.abs(Math.sin(this.animTime * 12)) * 2.5 : 0;

    let scaleX = isWalking ? (1 + Math.sin(this.animTime * 12) * 0.06) : (1 - Math.sin(this.animTime * 3) * 0.03);
    let scaleY = isWalking ? (1 - Math.sin(this.animTime * 12) * 0.06) : (1 + Math.sin(this.animTime * 3) * 0.03);

    if (this.hitWobble > 0) {
      const wobble = Math.sin(this.wobblePhase) * this.hitWobble;
      scaleX += wobble;
      scaleY -= wobble;
    }

    // Anchored firmly on ground
    ctx.translate(cx, bottomY + 1 - bounceY);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.5) contrast(1.4)';
    }

    ctx.scale(this.facing * scaleX, scaleY);

    const gummySprite = imageLoader.getImage('gummybear');
    const renderH = 48;
    const renderW = 38;

    if (gummySprite && gummySprite.complete && gummySprite.naturalWidth > 0) {
      ctx.drawImage(gummySprite, -renderW / 2, -renderH, renderW, renderH);
    } else {
      ctx.beginPath();
      ctx.roundRect(-16, -renderH, 32, 40, 10);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
}
