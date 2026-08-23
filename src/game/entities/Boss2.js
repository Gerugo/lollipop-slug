import { Projectile } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss2 {
  constructor(x = 6680, y = 230) {
    this.x = x;
    this.y = y;
    this.width = 190;
    this.height = 220;
    this.name = 'VOLCÁN TITAN';
    this.maxHp = 800;
    this.hp = 800;
    this.phase = 1; // 1: 100%-65%, 2: 65%-30%, 3: <30% OVERDRIVE
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

    // Attack State Machine & Timers
    this.isAnticipating = false;
    this.anticipationTimer = 0;
    this.pendingAttackType = 0;

    this.attackTimer = 0;
    this.slamTimer = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.isStunned = false;
    this.stunTimer = 0;

    this.rageMode = false;

    // Volcanic Mortar Danger Reticles on ground
    this.mortarTargets = [];

    // After-image ghosting trails during charge
    this.afterImages = [];
    this.ghostTimer = 0;
  }

  takeDamage(amount, particles, soundManager, camera) {
    try {
      if (this.dead || this.isDefeated) return;

      this.hp -= amount;
      this.hurtTimer = 0.08;
      this.hitWobble = 0.16;
      this.wobblePhase = 0;
      soundManager?.playBossHurt?.();

      if (amount >= 20 && camera) {
        camera.shake(6, 0.22);
      }

      if (particles) {
        particles.emitCandyShards(this.x + this.width / 2, this.y + 60, 5);
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + 40, 2, '#F97316');
      }

      // Phase 2 Transition (65% HP - Volcanic Core Breach)
      if (this.hp <= this.maxHp * 0.65 && this.phase === 1) {
        this.phase = 2;
        if (camera) camera.shake(18, 0.7);
        soundManager?.playExplosion?.();
        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 150, '#EA580C');
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + 60, 18, '#EA580C');
          particles.emitCandyShards(this.x + this.width / 2, this.y + 60, 22);
        }
      }
      // Phase 3 Transition (30% HP - VOLCANIC OVERDRIVE MELTDOWN)
      else if (this.hp <= this.maxHp * 0.30 && this.phase === 2) {
        this.phase = 3;
        this.rageMode = true;
        if (camera) camera.shake(24, 1.0);
        soundManager?.playBossAlarm?.();
        soundManager?.playExplosion?.();
        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 200, '#EF4444');
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + 60, 25, '#EF4444');
          particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 30, '#F59E0B');
        }
      }

      // Defeat Trigger
      if (this.hp <= 0) {
        this.hp = 0;
        this.startDefeatSequence(particles, soundManager, camera);
      }
    } catch (err) {
      console.error('[Boss2] takeDamage error:', err);
    }
  }

  startDefeatSequence(particles, soundManager, camera) {
    this.isDefeated = true;
    this.defeatTimer = 2.5;
    if (camera) camera.shake(24, 2.0);
    soundManager?.playBossDefeat?.();
  }

  update(dt, player, platforms, enemyProjectiles, enemies, particles, soundManager, camera) {
    try {
      this.idleTimer += dt;
      if (this.hurtTimer > 0) this.hurtTimer -= dt;
      if (this.attackTimer > 0) this.attackTimer -= dt;
      if (this.slamTimer > 0) this.slamTimer -= dt;

      // 1. UPDATE IMPACT WOBBLE OSCILLATION
      if (this.hitWobble > 0.001) {
        this.wobblePhase += dt * 32;
        this.hitWobble *= Math.exp(-dt * 12);
      } else {
        this.hitWobble = 0;
      }

      // 2. AMBIENT VOLCANIC SMOKE & EMBERS
      if (particles && Math.random() < (this.rageMode ? 0.45 : 0.22)) {
        const ventX = this.x + (Math.random() < 0.5 ? 40 : this.width - 40);
        particles.emitSugarSmoke(ventX, this.y + 20, 2, this.rageMode ? '#EF4444' : '#F97316');
      }

      // 3. UPDATE GHOSTING AFTER-IMAGES
      for (let i = this.afterImages.length - 1; i >= 0; i--) {
        const ghost = this.afterImages[i];
        ghost.alpha -= dt * 2.8;
        if (ghost.alpha <= 0) {
          this.afterImages.splice(i, 1);
        }
      }

      // 4. UPDATE VOLCANIC MORTAR RETICLES
      for (let i = this.mortarTargets.length - 1; i >= 0; i--) {
        const target = this.mortarTargets[i];
        target.timer -= dt;
        if (target.timer <= 0) {
          // Magma bomb hits ground!
          soundManager?.playExplosion?.();
          if (camera) camera.shake(12, 0.45);
          if (particles) {
            particles.emitExplosionSprite(target.x, target.y, 1.3);
            particles.emitShockwave(target.x, target.y, 80, '#EA580C');
            particles.emitCandyShards(target.x, target.y, 16);
            particles.emitSugarSmoke(target.x, target.y, 6, '#EF4444');
          }

          // Damage player if in blast radius
          if (player && !player.isDead) {
            const dist = Math.abs(player.x + player.width / 2 - target.x);
            if (dist < 52 && player.y + player.height >= target.y - 45) {
              player.takeDamage(1, target.x, particles, soundManager, camera);
            }
          }
          this.mortarTargets.splice(i, 1);
        }
      }

      // 5. DEFEAT SEQUENCE
      if (this.isDefeated) {
        this.defeatTimer -= dt;
        this.shakeOffsetX = (Math.random() - 0.5) * 12;
        if (Math.random() < 0.5 && particles) {
          const randX = this.x + Math.random() * this.width;
          const randY = this.y + Math.random() * this.height;
          soundManager?.playExplosion?.();
          particles.emitConfetti(randX, randY, 20);
          particles.emitCandyShards(randX, randY, 16);
          particles.emitSugarSmoke(randX, randY, 10, '#EA580C');
        }

        if (this.defeatTimer <= 0 && !this.dead) {
          this.dead = true;
          if (camera) camera.shake(30, 2.2);
          if (particles) {
            particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 120);
            particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 260, '#F97316');
          }
        }
        return;
      }

      // 6. MOVEMENT & WALKING INERTIA
      this.facing = (player && player.x < this.x) ? -1 : 1;
      const maxSpeed = this.rageMode ? 95 : (this.phase === 2 ? 70 : 50);

      if (this.isStunned) {
        this.vx = 0;
        this.stunTimer -= dt;
        this.rotation = Math.sin(this.idleTimer * 8) * 0.05;
        if (particles && Math.random() < 0.3) {
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + 40, 2, '#78350F');
        }
        if (this.stunTimer <= 0) {
          this.isStunned = false;
        }
      } else if (this.isDashing) {
        // Volcanic Charge Dash
        this.dashTimer -= dt;
        this.vx = this.facing * 360;
        this.stepArc = 0;
        this.rotation = this.facing * 0.18;

        this.ghostTimer += dt;
        if (this.ghostTimer >= 0.04) {
          this.ghostTimer = 0;
          this.afterImages.push({
            x: this.x + this.width / 2,
            y: this.y + this.height,
            rotation: this.rotation,
            facing: this.facing,
            alpha: 0.7
          });
        }

        if (player && !player.isDead && Physics.checkAABB(this, player)) {
          player.takeDamage(1, this.x, particles, soundManager, camera);
        }

        if (this.dashTimer <= 0) {
          this.isDashing = false;
          this.isStunned = true;
          this.stunTimer = 1.0;
        }
      } else if (this.isAnticipating) {
        this.anticipationTimer -= dt;
        this.vx = -this.facing * 22;
        this.stepArc = 0;
        this.rotation = -this.facing * 0.06;

        if (particles && Math.random() < 0.3) {
          particles.emitSparkles(this.x + (this.facing === 1 ? this.width : 0), this.y + 110, 3, '#F97316');
        }

        if (this.anticipationTimer <= 0) {
          this.isAnticipating = false;
          this.fireAttack(this.pendingAttackType, player, enemyProjectiles, enemies, particles, soundManager, camera);
        }
      } else {
        // Heavy walking stride
        this.walkTimer += dt;
        this.vx = Math.sin(this.walkTimer * (this.rageMode ? 1.8 : 1.1)) * maxSpeed;
        this.stepArc = Math.abs(Math.sin(this.walkTimer * 5)) * 6.5;
        this.rotation = (this.vx / maxSpeed) * 0.07;

        // Heavy footfall impact
        const stepVal = Math.sin(this.walkTimer * 5);
        if (stepVal < -0.85 && this.isGrounded) {
          if (!this.steppedThisCycle) {
            this.steppedThisCycle = true;
            if (camera) camera.shake(4.5, 0.16);
            const footX = this.x + (this.facing === -1 ? 35 : this.width - 35);
            if (particles) {
              particles.emitSugarSmoke(footX, this.y + this.height, 5, '#EA580C');
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

      // 7. ATTACK DISPATCH
      this.actionTimer += dt;
      const cooldown = this.rageMode ? 1.5 : (this.phase === 2 ? 2.0 : 2.6);

      if (this.actionTimer >= cooldown && !this.isAnticipating && !this.isDashing && !this.isStunned) {
        this.actionTimer = 0;
        const maxPatterns = this.phase === 3 ? 4 : (this.phase === 2 ? 3 : 2);
        this.attackPattern = (this.attackPattern + 1) % maxPatterns;
        this.startAttackTelegraph(this.attackPattern, soundManager, camera);
      }
    } catch (err) {
      console.error('[Boss2] update error:', err);
    }
  }

  startAttackTelegraph(pattern, soundManager, camera) {
    this.pendingAttackType = pattern;

    if (pattern === 0) {
      // Lava Volley
      this.isAnticipating = true;
      this.anticipationTimer = 0.55;
    } else if (pattern === 1) {
      // Magma Stomp
      this.vy = -300;
      this.slamTimer = 0.85;
      this.isAnticipating = true;
      this.anticipationTimer = 0.45;
    } else if (pattern === 2) {
      // Volcanic Rush Charge
      this.isAnticipating = true;
      this.anticipationTimer = 0.65;
    } else if (pattern === 3) {
      // Magma Meltdown Geyser Rain
      this.isAnticipating = true;
      this.anticipationTimer = 0.5;
    }
  }

  fireAttack(pattern, player, enemyProjectiles, enemies, particles, soundManager, camera) {
    try {
      // 1. LAVA VOLLEY (Magma balls barrage)
      if (pattern === 0) {
        this.attackTimer = 0.9;
        soundManager?.playRocketLaunch?.();
        if (camera) camera.shake(10, 0.4);

        if (enemyProjectiles) {
          const count = this.phase === 3 ? 4 : (this.phase === 2 ? 3 : 2);
          for (let i = 0; i < count; i++) {
            const spread = (i - (count - 1) / 2) * 45;
            enemyProjectiles.push(
              new Projectile({
                x: this.x + (this.facing === -1 ? 25 : this.width - 25),
                y: this.y + 40,
                vx: this.facing * (280 + Math.abs(spread) * 1.2),
                vy: -160 + spread * 1.5,
                type: 'FLAME_BURST',
                damage: 1,
                isPlayer: false
              })
            );
          }
        }
        if (particles) {
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + 30, 16, '#F97316');
        }
      }
      // 2. MAGMA STOMP (Shockwaves across ground)
      else if (pattern === 1) {
        this.slamTimer = 0.7;
        soundManager?.playExplosion?.();
        if (camera) camera.shake(16, 0.7);

        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height, 120, '#EA580C');
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height, 15, '#EA580C');
        }

        if (enemyProjectiles) {
          [-1, 1].forEach(d => {
            enemyProjectiles.push(
              new Projectile({
                x: this.x + this.width / 2 + d * 35,
                y: this.y + this.height - 20,
                vx: d * 250,
                vy: 0,
                type: 'EEL_BOLT',
                damage: 1,
                isPlayer: false
              })
            );
          });
        }
      }
      // 3. VOLCANIC CHARGE DASH
      else if (pattern === 2) {
        this.isDashing = true;
        this.dashTimer = 0.85;
        soundManager?.playBossAlarm?.();
        if (camera) camera.shake(12, 0.8);
      }
      // 4. MAGMA GEYSER RAIN WITH WARNING RETICLES (PHASE 3)
      else if (pattern === 3 && this.phase === 3) {
        this.attackTimer = 1.0;
        soundManager?.playRocketLaunch?.();
        if (camera) camera.shake(14, 0.6);

        const skyCenter = player ? player.x : this.x - 300;
        for (let i = 0; i < 5; i++) {
          const targetX = skyCenter + (Math.random() - 0.5) * 480;
          this.mortarTargets.push({
            x: Math.max(this.x - 650, Math.min(this.x + 200, targetX)),
            y: 470,
            timer: 0.85 + i * 0.22
          });
        }
        if (particles) {
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + 20, 22, '#EF4444');
        }
      }
    } catch (err) {
      console.error('[Boss2] fireAttack error:', err);
    }
  }

  draw(ctx) {
    if (this.dead) return;

    try {
      const cx = this.x + this.width / 2;
      const bottomY = this.y + this.height;

      // 1. Draw Mortar Warning Danger Reticles on Ground
      if (this.mortarTargets.length > 0) {
        for (const target of this.mortarTargets) {
          ctx.save();
          const pulse = Math.sin(this.idleTimer * 16) * 4;
          const radius = 30 + pulse;

          ctx.beginPath();
          ctx.ellipse(target.x, target.y, radius, radius * 0.4, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(234, 88, 12, 0.32)';
          ctx.fill();
          ctx.strokeStyle = '#EA580C';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Danger crosshair
          ctx.beginPath();
          ctx.moveTo(target.x - 16, target.y);
          ctx.lineTo(target.x + 16, target.y);
          ctx.moveTo(target.x, target.y - 9);
          ctx.lineTo(target.x, target.y + 9);
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Ground Contact Shadow
      const groundY = 460;
      const distToGround = Math.max(0, groundY - bottomY);
      const maxDist = 380;
      if (distToGround < maxDist) {
        const shadowFactor = 1 - (distToGround / maxDist);
        const shadowAlpha = this.isGrounded ? 0.45 : (0.15 + 0.30 * shadowFactor);
        const shadowW = 80 * (this.isGrounded ? 1.0 : (0.85 + 0.35 * (1 - shadowFactor)));
        const shadowH = 20 * (this.isGrounded ? 1.0 : (0.75 + 0.25 * (1 - shadowFactor)));

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, groundY + 3, shadowW, shadowH, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.fill();

        if (this.isGrounded && distToGround < 5) {
          ctx.beginPath();
          ctx.ellipse(cx, groundY + 1, shadowW * 0.78, 5, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Dynamic Sprite Selection
      let bossSprite = imageLoader.getImage('boss2');
      if (this.attackTimer > 0 || this.slamTimer > 0) {
        bossSprite = imageLoader.getImage('boss2_attack') || bossSprite;
      } else if (this.rageMode) {
        bossSprite = imageLoader.getImage('boss2_rage') || bossSprite;
      } else if (Math.abs(this.vx) > 8 && Math.sin(this.walkTimer * 5) > 0) {
        bossSprite = imageLoader.getImage('boss2_walk') || bossSprite;
      }

      const renderW = 190;
      const renderH = 220;

      // 4. Ghosting Trails during Charge
      if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0 && this.afterImages.length > 0) {
        for (const ghost of this.afterImages) {
          ctx.save();
          ctx.globalAlpha = ghost.alpha * 0.55;
          ctx.translate(ghost.x, ghost.y);
          ctx.rotate(ghost.rotation);
          ctx.scale(ghost.facing, 1);
          ctx.filter = 'drop-shadow(0 0 12px rgba(234, 88, 12, 0.85)) hue-rotate(-20deg)';
          ctx.drawImage(bossSprite, -renderW / 2, -renderH, renderW, renderH);
          ctx.restore();
        }
      }

      // 5. Main Boss Rendering
      ctx.save();
      ctx.translate(cx + this.shakeOffsetX, bottomY - this.stepArc);
      ctx.rotate(this.rotation);

      if (this.hurtTimer > 0) {
        ctx.filter = 'brightness(2.4) contrast(1.2)';
      } else if (this.rageMode) {
        ctx.filter = 'drop-shadow(0 0 24px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 35px rgba(245, 158, 11, 0.7))';
      } else if (this.phase === 2) {
        ctx.filter = 'drop-shadow(0 0 16px rgba(234, 88, 12, 0.75))';
      }

      let scaleY = 1 + Math.sin(this.idleTimer * 3) * 0.035;
      let scaleX = 1 - Math.sin(this.idleTimer * 3) * 0.035;

      if (this.isAnticipating) {
        scaleY *= 0.88;
        scaleX *= 1.10;
      }

      if (this.hitWobble > 0) {
        const wobble = Math.sin(this.wobblePhase) * this.hitWobble;
        scaleX += wobble;
        scaleY -= wobble;
      }

      ctx.scale(this.facing * scaleX, scaleY);

      if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
        ctx.drawImage(bossSprite, -renderW / 2, -renderH, renderW, renderH);
      } else {
        ctx.beginPath();
        ctx.roundRect(-85, -renderH, 170, 190, 24);
        ctx.fillStyle = this.rageMode ? '#EF4444' : '#EA580C';
        ctx.fill();
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.restore();
    } catch (err) {
      console.error('[Boss2] draw error:', err);
    }
  }
}
