import { Projectile } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss {
  constructor(x = 3100, y = 230) {
    this.x = x;
    this.y = y;
    this.width = 180;
    this.height = 210;
    this.name = 'GUMBALL MECH TITAN';
    this.maxHp = 600;
    this.hp = 600;
    this.phase = 1; // 1: 100%-70%, 2: 70%-35%, 3: <35% OVERDRIVE
    this.dead = false;
    this.isDefeated = false;
    this.defeatTimer = 0;

    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
    this.isGrounded = false;
    this.gravity = 700;

    // Advanced Procedural Animation Timers & Physics
    this.idleTimer = 0;
    this.walkTimer = 0;
    this.actionTimer = 0;
    this.attackPattern = 0;
    this.hurtTimer = 0;
    this.hitWobble = 0;
    this.wobblePhase = 0;
    this.rotation = 0;
    this.stepArc = 0;
    this.shakeOffsetX = 0;
    this.steppedThisCycle = false;

    // Telegraphing & Attack State Machine
    this.isAnticipating = false;
    this.anticipationTimer = 0;
    this.pendingAttackType = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.laserActive = false;
    this.laserTimer = 0;
    this.rageMode = false;

    // After-image ghosting trails during charge
    this.afterImages = [];
    this.ghostTimer = 0;
  }

  takeDamage(amount, particles, soundManager, camera) {
    try {
      if (this.dead || this.isDefeated) return;

      this.hp -= amount;
      this.hurtTimer = 0.08; // 0.08s impact flash
      this.hitWobble = 0.14;  // Damped spring deformation on armor
      this.wobblePhase = 0;
      soundManager.playBossHurt();

      if (amount >= 20 && camera) {
        camera.shake(5, 0.2);
      }

      if (particles) {
        particles.emitCandyShards(this.x + this.width / 2, this.y + 60, 4);
      }

      // Phase 2 Transition (70% HP)
      if (this.hp <= this.maxHp * 0.70 && this.phase === 1) {
        this.phase = 2;
        if (camera) camera.shake(14, 0.6);
        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 120, '#F59E0B');
        }
      }
      // Phase 3 Transition (35% HP - OVERDRIVE)
      else if (this.hp <= this.maxHp * 0.35 && this.phase === 2) {
        this.phase = 3;
        this.rageMode = true;
        if (camera) camera.shake(18, 0.8);
        soundManager.playBossAlarm();
        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 160, '#EC4899');
        }
      }

      // Defeat Trigger
      if (this.hp <= 0) {
        this.hp = 0;
        this.startDefeatSequence(particles, soundManager, camera);
      }
    } catch (err) {
      console.error('[Boss] takeDamage error:', err);
    }
  }

  startDefeatSequence(particles, soundManager, camera) {
    this.isDefeated = true;
    this.defeatTimer = 2.0;
    if (camera) camera.shake(20, 1.5);
    soundManager.playBossDefeat();
  }

  update(dt, player, platforms, enemyProjectiles, enemies, particles, soundManager, camera) {
    try {
      this.idleTimer += dt;
      if (this.hurtTimer > 0) this.hurtTimer -= dt;

      // 1. UPDATE IMPACT WOBBLE OSCILLATION
      if (this.hitWobble > 0.001) {
        this.wobblePhase += dt * 32;
        this.hitWobble *= Math.exp(-dt * 12);
      } else {
        this.hitWobble = 0;
      }

      // 2. UPDATE GHOSTING AFTER-IMAGES
      for (let i = this.afterImages.length - 1; i >= 0; i--) {
        const ghost = this.afterImages[i];
        ghost.alpha -= dt * 2.8;
        if (ghost.alpha <= 0) {
          this.afterImages.splice(i, 1);
        }
      }

      // 3. DEFEAT SEQUENCE
      if (this.isDefeated) {
        this.defeatTimer -= dt;
        this.shakeOffsetX = (Math.random() - 0.5) * 8;
        if (Math.random() < 0.4 && particles) {
          const randX = this.x + Math.random() * this.width;
          const randY = this.y + Math.random() * this.height;
          soundManager.playExplosion();
          particles.emitConfetti(randX, randY, 16);
          particles.emitCandyShards(randX, randY, 12);
          particles.emitSugarSmoke(randX, randY, 8, '#EC4899');
        }

        if (this.defeatTimer <= 0 && !this.dead) {
          this.dead = true;
          if (camera) camera.shake(25, 1.8);
          if (particles) {
            particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 80);
            particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 200, '#FF77B0');
          }
        }
        return;
      }

      // 4. MOVEMENT, STRIDE ARC & INERTIA
      this.facing = (player && player.x < this.x) ? -1 : 1;
      const maxSpeed = this.rageMode ? 85 : 45;

      if (this.isDashing) {
        // Phase 2 Charge Attack
        this.dashTimer -= dt;
        this.vx = this.facing * 310;
        this.stepArc = 0;
        this.rotation = this.facing * 0.14; // 8° aggressive tilt forward

        // Record ghosting trail
        this.ghostTimer += dt;
        if (this.ghostTimer >= 0.04) {
          this.ghostTimer = 0;
          this.afterImages.push({
            x: this.x + this.width / 2,
            y: this.y + this.height,
            rotation: this.rotation,
            facing: this.facing,
            alpha: 0.6
          });
        }

        if (this.dashTimer <= 0) {
          this.isDashing = false;
        }
      } else if (this.isAnticipating) {
        // Telegraphing anticipation (crouches and steps back)
        this.anticipationTimer -= dt;
        this.vx = -this.facing * 25; // Slight recoil back
        this.stepArc = 0;
        this.rotation = -this.facing * 0.04;

        if (this.anticipationTimer <= 0) {
          this.isAnticipating = false;
          this.fireAttack(this.pendingAttackType, player, enemyProjectiles, enemies, particles, soundManager, camera);
        }
      } else {
        // Natural walking stride with vertical arc
        this.walkTimer += dt;
        this.vx = Math.sin(this.walkTimer * (this.rageMode ? 1.6 : 0.9)) * maxSpeed;
        this.stepArc = Math.abs(Math.sin(this.walkTimer * 5)) * 6;
        this.rotation = (this.vx / maxSpeed) * 0.06; // Angular tilt based on acceleration

        // Footfall detection (lowest point of stride -> micro screen shake & dust)
        const stepVal = Math.sin(this.walkTimer * 5);
        if (stepVal < -0.85 && this.isGrounded) {
          if (!this.steppedThisCycle) {
            this.steppedThisCycle = true;
            if (camera) camera.shake(150, 3);
            const footX = this.x + (this.facing === -1 ? 35 : this.width - 35);
            if (particles) {
              particles.emitSugarSmoke(footX, this.y + this.height, 4, '#BBF7D0');
            }
          }
        } else if (stepVal > 0) {
          this.steppedThisCycle = false;
        }
      }

      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);

      // 5. ATTACK COOLDOWN & TELEGRAPHING DISPATCH
      this.actionTimer += dt;
      const cooldown = this.rageMode ? 1.4 : (this.phase === 2 ? 1.9 : 2.5);

      if (this.actionTimer >= cooldown && !this.isAnticipating && !this.isDashing) {
        this.actionTimer = 0;
        this.attackPattern = (this.attackPattern + 1) % (this.phase === 3 ? 4 : (this.phase === 2 ? 3 : 2));
        this.startAttackTelegraph(this.attackPattern, soundManager, camera);
      }

      // 6. OVERDRIVE LASER BEAM & INTENSE SHAKE
      if (this.laserActive) {
        this.laserTimer -= dt;
        this.shakeOffsetX = (Math.random() - 0.5) * 6; // Intense X jitter during laser beam

        if (this.laserTimer <= 0) {
          this.laserActive = false;
          this.shakeOffsetX = 0;
        } else if (player) {
          const laserY = this.y + 115;
          if (
            player.y + player.height > laserY - 16 &&
            player.y < laserY + 16 &&
            ((this.facing === -1 && player.x < this.x) || (this.facing === 1 && player.x > this.x))
          ) {
            player.takeDamage(1, this.x, particles, soundManager, camera);
          }
        }
      } else if (!this.isDefeated) {
        this.shakeOffsetX = 0;
      }
    } catch (err) {
      console.error('[Boss] update error:', err);
    }
  }

  startAttackTelegraph(pattern, soundManager, camera) {
    this.pendingAttackType = pattern;

    if (pattern === 0 || (this.phase === 1 && pattern === 1)) {
      // Gumball Volley: 0.5s anticipation crouch
      this.isAnticipating = true;
      this.anticipationTimer = 0.5;
    } else if (pattern === 1 && this.phase >= 2) {
      // Charge & Boomerang Cane: Initiate charge dash!
      this.isDashing = true;
      this.dashTimer = 0.55;
      if (camera) camera.shake(8, 0.4);
    } else if (pattern === 2 && this.phase === 3) {
      // Overdrive Laser: Immediate energy charge & firing
      this.laserActive = true;
      this.laserTimer = 1.1;
      soundManager.playBossAlarm();
      if (camera) camera.shake(12, 0.9);
    } else if (pattern === 3 && this.phase === 3) {
      // Candy Rain
      this.fireAttack(3, null, null, null, null, soundManager, camera);
    }
  }

  fireAttack(pattern, player, enemyProjectiles, enemies, particles, soundManager, camera) {
    try {
      const bellyX = this.x + (this.facing === -1 ? 15 : this.width - 15);
      const bellyY = this.y + 110;

      // FASE 1: DISPARO DE 3 A 5 BOLAS DE CHICLE CON REBOTE & RECOIL
      if (pattern === 0 || (this.phase === 1 && pattern === 1)) {
        soundManager.playShotgun();
        if (camera) camera.shake(7, 0.3);

        // Recoil pushback
        this.vx = -this.facing * 120;
        this.vy = -60;

        const count = this.phase === 3 ? 5 : (this.phase === 2 ? 4 : 3);
        const baseAngle = this.facing === -1 ? Math.PI : 0;
        const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];

        if (enemyProjectiles) {
          for (let i = 0; i < count; i++) {
            const angleOffset = ((i - (count - 1) / 2) * 0.18) + (Math.random() - 0.5) * 0.08;
            const angle = baseAngle + angleOffset;
            const speed = 290 + Math.random() * 80;
            enemyProjectiles.push(
              new Projectile({
                x: bellyX,
                y: bellyY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 60,
                type: 'GUMBALL',
                bounces: 3,
                gravity: 450,
                damage: 1,
                isPlayer: false,
                color: colors[i % colors.length]
              })
            );
          }
        }
        if (particles) {
          particles.emitSodaBubbles(bellyX, bellyY, 10);
        }
      }

      // FASE 2: BASTONES DE CARAMELO GIRATORIOS
      else if (pattern === 1 && this.phase >= 2) {
        soundManager.playRocketLaunch();
        if (enemyProjectiles) {
          for (let i = 0; i < 2; i++) {
            enemyProjectiles.push(
              new Projectile({
                x: this.x + this.width / 2,
                y: this.y + 40,
                vx: this.facing * (240 + i * 60),
                vy: -200 - i * 90,
                type: 'CANDY_CANE',
                damage: 1,
                isPlayer: false
              })
            );
          }
        }
      }

      // FASE 3: LLUVIA DE CARAMELOS DESDE EL CIELO
      else if (pattern === 3 && this.phase === 3) {
        soundManager.playExplosion();
        if (camera) camera.shake(16, 0.8);
        const skyCenter = player ? player.x : this.x - 300;
        const rainColors = ['#EC4899', '#FBBF24', '#38BDF8', '#A7F3D0'];

        if (enemyProjectiles) {
          for (let i = 0; i < 6; i++) {
            const dropX = skyCenter + (Math.random() - 0.5) * 480;
            enemyProjectiles.push(
              new Projectile({
                x: dropX,
                y: 20 + Math.random() * 40,
                vx: (Math.random() - 0.5) * 60,
                vy: 290 + Math.random() * 120,
                type: 'GUMBALL',
                bounces: 2,
                damage: 1,
                isPlayer: false,
                color: rainColors[i % rainColors.length]
              })
            );
          }
        }
        if (particles) {
          particles.emitSodaBubbles(this.x + this.width / 2, this.y + 60, 25);
        }
      }
    } catch (err) {
      console.error('[Boss] fireAttack error:', err);
    }
  }

  draw(ctx) {
    if (this.dead) return;

    try {
      const cx = this.x + this.width / 2;
      const bottomY = this.y + this.height;

      // 1. Soft Elliptical Ground Shadow (pinned at base)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, bottomY + 3, 75, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fill();
      ctx.restore();

      const bossSprite = imageLoader.getImage('boss');
      const renderW = 180;
      const renderH = 210;

      // 2. Draw After-Images (Ghosting trails during charge)
      if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0 && this.afterImages.length > 0) {
        for (const ghost of this.afterImages) {
          ctx.save();
          ctx.globalAlpha = ghost.alpha * 0.5;
          ctx.translate(ghost.x, ghost.y);
          ctx.rotate(ghost.rotation);
          ctx.scale(ghost.facing, 1);
          ctx.filter = 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.8)) hue-rotate(40deg)';
          ctx.drawImage(bossSprite, -renderW / 2, -renderH, renderW, renderH);
          ctx.restore();
        }
      }

      // 3. Main Boss Rendering with Bottom-Center Pivot
      ctx.save();

      // Translate to bottom-center pivot point on floor
      ctx.translate(cx + this.shakeOffsetX, bottomY - this.stepArc);
      ctx.rotate(this.rotation);

      // Hit feedback filter (brightness 2.2 for 0.08s)
      if (this.hurtTimer > 0) {
        ctx.filter = 'brightness(2.2)';
      } 
      // Phase 3 Aura (Overdrive Magenta)
      else if (this.rageMode) {
        ctx.filter = 'drop-shadow(0 0 22px rgba(236, 72, 153, 0.95)) drop-shadow(0 0 35px rgba(244, 63, 94, 0.6))';
      } 
      // Phase 2 Aura (Amber Energy)
      else if (this.phase === 2) {
        ctx.filter = 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.7))';
      }

      // Weight & Breathing Squash & Stretch
      let scaleY = 1 + Math.sin(this.idleTimer * 3) * 0.035;
      let scaleX = 1 - Math.sin(this.idleTimer * 3) * 0.035;

      // Telegraphing Anticipation Crouch (10% additional squash)
      if (this.isAnticipating) {
        scaleY *= 0.90;
        scaleX *= 1.08;
      }

      // Impact Damped Spring Oscillation
      if (this.hitWobble > 0) {
        const wobble = Math.sin(this.wobblePhase) * this.hitWobble;
        scaleX += wobble;
        scaleY -= wobble;
      }

      ctx.scale(this.facing * scaleX, scaleY);

      if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
        // Draw boss sprite anchored at bottom center: (-renderW / 2, -renderH)
        ctx.drawImage(bossSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        // Fallback procedural mech
        ctx.beginPath();
        ctx.roundRect(-80, -renderH, 160, 180, 24);
        ctx.fillStyle = this.rageMode ? '#EC4899' : '#0284C7';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Laser Beam Overlay during Overdrive
      if (this.laserActive) {
        const startX = 65;
        const startY = -95;
        const laserEnd = 850;

        const laserGrad = ctx.createLinearGradient(startX, startY, laserEnd, startY);
        laserGrad.addColorStop(0, '#FFFFFF');
        laserGrad.addColorStop(0.2, '#EC4899');
        laserGrad.addColorStop(1, '#F43F5E');

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(laserEnd, startY);
        ctx.strokeStyle = laserGrad;
        ctx.lineWidth = 18 + Math.sin(this.idleTimer * 30) * 5;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(laserEnd, startY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      ctx.restore();
    } catch (err) {
      console.error('[Boss] draw error:', err);
    }
  }
}
