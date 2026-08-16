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

    // Attack State Machine & Timers
    this.isAnticipating = false;
    this.anticipationTimer = 0;
    this.pendingAttackType = 0;

    this.cannonTimer = 0;
    this.slamTimer = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.isStunned = false;
    this.stunTimer = 0;

    this.isLaserAiming = false;
    this.laserAimTimer = 0;
    this.laserActive = false;
    this.laserTimer = 0;
    this.rageMode = false;

    // Candy Mortar Danger Reticles on ground
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
      this.hitWobble = 0.15;
      this.wobblePhase = 0;
      soundManager.playBossHurt();

      if (amount >= 20 && camera) {
        camera.shake(6, 0.22);
      }

      if (particles) {
        particles.emitCandyShards(this.x + this.width / 2, this.y + 60, 4);
      }

      // Phase 2 Transition (70% HP - Armor Breach)
      if (this.hp <= this.maxHp * 0.70 && this.phase === 1) {
        this.phase = 2;
        if (camera) camera.shake(16, 0.65);
        soundManager.playExplosion();
        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 140, '#F59E0B');
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + 60, 16, '#F59E0B');
          particles.emitCandyShards(this.x + this.width / 2, this.y + 60, 20);
        }
      }
      // Phase 3 Transition (35% HP - OVERDRIVE RAGE)
      else if (this.hp <= this.maxHp * 0.35 && this.phase === 2) {
        this.phase = 3;
        this.rageMode = true;
        if (camera) camera.shake(22, 0.9);
        soundManager.playBossAlarm();
        soundManager.playExplosion();
        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 180, '#EC4899');
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + 60, 20, '#EC4899');
          particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 25, '#F43F5E');
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
    this.defeatTimer = 2.4;
    if (camera) camera.shake(22, 1.8);
    soundManager.playBossDefeat();
  }

  update(dt, player, platforms, enemyProjectiles, enemies, particles, soundManager, camera) {
    try {
      this.idleTimer += dt;
      if (this.hurtTimer > 0) this.hurtTimer -= dt;
      if (this.cannonTimer > 0) this.cannonTimer -= dt;
      if (this.slamTimer > 0) this.slamTimer -= dt;

      // 1. UPDATE IMPACT WOBBLE OSCILLATION
      if (this.hitWobble > 0.001) {
        this.wobblePhase += dt * 32;
        this.hitWobble *= Math.exp(-dt * 12);
      } else {
        this.hitWobble = 0;
      }

      // 2. AMBIENT SMOKE/SPARKS WHEN DAMAGED
      if (this.phase >= 2 && particles && Math.random() < (this.rageMode ? 0.35 : 0.15)) {
        particles.emitSugarSmoke(this.x + this.width * 0.3 + Math.random() * 40, this.y + 40, 1, this.rageMode ? '#EC4899' : '#F59E0B');
      }

      // 3. UPDATE GHOSTING AFTER-IMAGES
      for (let i = this.afterImages.length - 1; i >= 0; i--) {
        const ghost = this.afterImages[i];
        ghost.alpha -= dt * 2.8;
        if (ghost.alpha <= 0) {
          this.afterImages.splice(i, 1);
        }
      }

      // 4. UPDATE MORTAR TARGET RETICLES
      for (let i = this.mortarTargets.length - 1; i >= 0; i--) {
        const target = this.mortarTargets[i];
        target.timer -= dt;
        if (target.timer <= 0) {
          // Mortar shell lands!
          soundManager.playExplosion();
          if (camera) camera.shake(10, 0.4);
          if (particles) {
            particles.emitExplosionSprite(target.x, target.y, 1.2);
            particles.emitShockwave(target.x, target.y, 70, '#EC4899');
            particles.emitCandyShards(target.x, target.y, 14);
          }

          // Damage player if in blast radius
          if (player && !player.isDead) {
            const dist = Math.abs(player.x + player.width / 2 - target.x);
            if (dist < 48 && player.y + player.height >= target.y - 40) {
              player.takeDamage(1, target.x, particles, soundManager, camera);
            }
          }
          this.mortarTargets.splice(i, 1);
        }
      }

      // 5. DEFEAT SEQUENCE
      if (this.isDefeated) {
        this.defeatTimer -= dt;
        this.shakeOffsetX = (Math.random() - 0.5) * 10;
        if (Math.random() < 0.45 && particles) {
          const randX = this.x + Math.random() * this.width;
          const randY = this.y + Math.random() * this.height;
          soundManager.playExplosion();
          particles.emitConfetti(randX, randY, 18);
          particles.emitCandyShards(randX, randY, 14);
          particles.emitSugarSmoke(randX, randY, 8, '#EC4899');
        }

        if (this.defeatTimer <= 0 && !this.dead) {
          this.dead = true;
          if (camera) camera.shake(28, 2.0);
          if (particles) {
            particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 100);
            particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 240, '#FF77B0');
          }
        }
        return;
      }

      // 6. MOVEMENT, STRIDE ARC & INERTIA
      this.facing = (player && player.x < this.x) ? -1 : 1;
      const maxSpeed = this.rageMode ? 90 : (this.phase === 2 ? 65 : 45);

      if (this.isStunned) {
        // Exhaustion / vulnerable recovery window after charge
        this.vx = 0;
        this.stunTimer -= dt;
        this.rotation = Math.sin(this.idleTimer * 8) * 0.05;
        if (particles && Math.random() < 0.3) {
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + 40, 2, '#94A3B8');
        }
        if (this.stunTimer <= 0) {
          this.isStunned = false;
        }
      } else if (this.isDashing) {
        // Charge Attack Dash
        this.dashTimer -= dt;
        this.vx = this.facing * 340;
        this.stepArc = 0;
        this.rotation = this.facing * 0.16;

        this.ghostTimer += dt;
        if (this.ghostTimer >= 0.04) {
          this.ghostTimer = 0;
          this.afterImages.push({
            x: this.x + this.width / 2,
            y: this.y + this.height,
            rotation: this.rotation,
            facing: this.facing,
            alpha: 0.65
          });
        }

        // Deal damage if running into player
        if (player && !player.isDead && Physics.checkAABB(this, player)) {
          player.takeDamage(1, this.x, particles, soundManager, camera);
        }

        if (this.dashTimer <= 0) {
          this.isDashing = false;
          this.isStunned = true;
          this.stunTimer = 1.1; // 1.1s stun window for player to attack!
        }
      } else if (this.isAnticipating) {
        // Telegraphing anticipation (crouches and coils spring back)
        this.anticipationTimer -= dt;
        this.vx = -this.facing * 20;
        this.stepArc = 0;
        this.rotation = -this.facing * 0.05;

        if (particles && Math.random() < 0.25) {
          particles.emitSparkles(this.x + (this.facing === 1 ? this.width : 0), this.y + 110, 2, '#F59E0B');
        }

        if (this.anticipationTimer <= 0) {
          this.isAnticipating = false;
          this.fireAttack(this.pendingAttackType, player, enemyProjectiles, enemies, particles, soundManager, camera);
        }
      } else if (this.isLaserAiming) {
        // Laser Telegraph Guide Line
        this.laserAimTimer -= dt;
        this.vx = 0;
        if (this.laserAimTimer <= 0) {
          this.isLaserAiming = false;
          this.laserActive = true;
          this.laserTimer = 1.15;
          soundManager.playBossAlarm();
          if (camera) camera.shake(14, 0.95);
        }
      } else {
        // Natural walking stride
        this.walkTimer += dt;
        this.vx = Math.sin(this.walkTimer * (this.rageMode ? 1.7 : 1.0)) * maxSpeed;
        this.stepArc = Math.abs(Math.sin(this.walkTimer * 5)) * 6;
        this.rotation = (this.vx / maxSpeed) * 0.06;

        // Footfall detection
        const stepVal = Math.sin(this.walkTimer * 5);
        if (stepVal < -0.85 && this.isGrounded) {
          if (!this.steppedThisCycle) {
            this.steppedThisCycle = true;
            if (camera) camera.shake(4, 0.15);
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

      // 7. ATTACK COOLDOWN & DISPATCH
      this.actionTimer += dt;
      const cooldown = this.rageMode ? 1.6 : (this.phase === 2 ? 2.1 : 2.7);

      if (this.actionTimer >= cooldown && !this.isAnticipating && !this.isDashing && !this.isStunned && !this.isLaserAiming && !this.laserActive) {
        this.actionTimer = 0;
        const maxPatterns = this.phase === 3 ? 4 : (this.phase === 2 ? 3 : 2);
        this.attackPattern = (this.attackPattern + 1) % maxPatterns;
        this.startAttackTelegraph(this.attackPattern, soundManager, camera);
      }

      // 8. HYPER LASER BEAM ACTIVE
      if (this.laserActive) {
        this.laserTimer -= dt;
        this.shakeOffsetX = (Math.random() - 0.5) * 6;

        if (this.laserTimer <= 0) {
          this.laserActive = false;
          this.shakeOffsetX = 0;
        } else if (player) {
          const laserY = this.y + 115;
          if (
            player.y + player.height > laserY - 18 &&
            player.y < laserY + 18 &&
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

    if (pattern === 0) {
      // Gumball Volley: 0.5s anticipation
      this.isAnticipating = true;
      this.anticipationTimer = 0.5;
    } else if (pattern === 1 && this.phase === 1) {
      // Phase 1 Titan Stomp: Jumps up then slams down
      this.vy = -280;
      this.slamTimer = 0.8;
      this.isAnticipating = true;
      this.anticipationTimer = 0.4;
    } else if (pattern === 1 && this.phase >= 2) {
      // Phase 2 Charge Dash
      this.isDashing = true;
      this.dashTimer = 0.6;
      this.slamTimer = 0.8;
      if (camera) camera.shake(9, 0.4);
    } else if (pattern === 2 && this.phase >= 2) {
      // Cane Boomerangs or Laser in Phase 3
      if (this.phase === 3) {
        // Laser Guide Telegraph
        this.isLaserAiming = true;
        this.laserAimTimer = 0.75;
      } else {
        // Cane Boomerangs
        this.isAnticipating = true;
        this.anticipationTimer = 0.45;
      }
    } else if (pattern === 3 && this.phase === 3) {
      // Candy Mortar Rain
      this.fireAttack(3, null, null, null, null, soundManager, camera);
    }
  }

  fireAttack(pattern, player, enemyProjectiles, enemies, particles, soundManager, camera) {
    try {
      const bellyX = this.x + (this.facing === -1 ? 15 : this.width - 15);
      const bellyY = this.y + 110;

      // 1. GUMBALL VOLLEY
      if (pattern === 0) {
        this.cannonTimer = 0.5;
        soundManager.playShotgun();
        if (camera) camera.shake(7, 0.3);

        this.vx = -this.facing * 130;
        this.vy = -50;

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
          particles.emitSodaBubbles(bellyX, bellyY, 12);
        }
      }

      // 2. TITAN STOMP (PHASE 1) - SPAWNS GROUND SHOCKWAVE HAZARD
      else if (pattern === 1 && this.phase === 1) {
        this.slamTimer = 0.6;
        soundManager.playExplosion();
        if (camera) camera.shake(14, 0.6);

        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height, 100, '#F59E0B');
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height, 12, '#F59E0B');
        }

        // Spawn left and right ground shockwaves that player must jump over
        if (enemyProjectiles) {
          [-1, 1].forEach(d => {
            enemyProjectiles.push(
              new Projectile({
                x: this.x + this.width / 2 + d * 30,
                y: this.y + this.height - 18,
                vx: d * 230,
                vy: 0,
                type: 'EEL_BOLT',
                damage: 1,
                isPlayer: false
              })
            );
          });
        }
      }

      // 3. CANE BOOMERANGS (PHASE 2 & 3)
      else if (pattern === 2 && this.phase === 2) {
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

      // 4. CANDY MORTAR RAIN (PHASE 3) WITH GROUND WARNING RETICLES
      else if (pattern === 3 && this.phase === 3) {
        soundManager.playRocketLaunch();
        if (camera) camera.shake(12, 0.5);

        const skyCenter = player ? player.x : this.x - 300;
        for (let i = 0; i < 4; i++) {
          const targetX = skyCenter + (Math.random() - 0.5) * 440;
          this.mortarTargets.push({
            x: Math.max(this.x - 600, Math.min(this.x + 200, targetX)),
            y: 470,
            timer: 0.9 + i * 0.25
          });
        }
        if (particles) {
          particles.emitSodaBubbles(this.x + this.width / 2, this.y + 40, 20);
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

      // 1. Draw Mortar Warning Danger Reticles on Ground
      if (this.mortarTargets.length > 0) {
        for (const target of this.mortarTargets) {
          ctx.save();
          const pulse = Math.sin(this.idleTimer * 16) * 4;
          const radius = 28 + pulse;

          ctx.beginPath();
          ctx.ellipse(target.x, target.y, radius, radius * 0.4, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
          ctx.fill();
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Danger crosshair
          ctx.beginPath();
          ctx.moveTo(target.x - 14, target.y);
          ctx.lineTo(target.x + 14, target.y);
          ctx.moveTo(target.x, target.y - 8);
          ctx.lineTo(target.x, target.y + 8);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Dynamic Grounded Contact & Cast Shadow
      const groundY = 460;
      const distToGround = Math.max(0, groundY - bottomY);
      const maxDist = 380;
      if (distToGround < maxDist) {
        const shadowFactor = 1 - (distToGround / maxDist);
        const shadowAlpha = this.isGrounded ? 0.42 : (0.12 + 0.30 * shadowFactor);
        const shadowW = 75 * (this.isGrounded ? 1.0 : (0.85 + 0.35 * (1 - shadowFactor)));
        const shadowH = 18 * (this.isGrounded ? 1.0 : (0.75 + 0.25 * (1 - shadowFactor)));

        ctx.save();
        // Diffuse outer shadow
        ctx.beginPath();
        ctx.ellipse(cx, groundY + 3, shadowW, shadowH, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.fill();

        // Dark contact occlusion base under massive candy feet
        if (this.isGrounded && distToGround < 5) {
          ctx.beginPath();
          ctx.ellipse(cx, groundY + 1, shadowW * 0.75, 4.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Dynamic Sprite Selection
      let bossSprite = imageLoader.getImage('boss');
      if (this.cannonTimer > 0) {
        bossSprite = imageLoader.getImage('boss_cannon') || bossSprite;
      } else if (this.slamTimer > 0 || this.isDashing) {
        bossSprite = imageLoader.getImage('boss_slam') || bossSprite;
      } else if (this.rageMode || this.laserActive || this.isLaserAiming) {
        bossSprite = imageLoader.getImage('boss_rage') || bossSprite;
      }

      const renderW = 180;
      const renderH = 210;

      // 4. Draw Ghosting Trails during Charge
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

      // 5. Main Boss Rendering
      ctx.save();
      ctx.translate(cx + this.shakeOffsetX, bottomY - this.stepArc);
      ctx.rotate(this.rotation);

      if (this.hurtTimer > 0) {
        ctx.filter = 'brightness(2.2)';
      } else if (this.rageMode) {
        ctx.filter = 'drop-shadow(0 0 22px rgba(236, 72, 153, 0.95)) drop-shadow(0 0 35px rgba(244, 63, 94, 0.6))';
      } else if (this.phase === 2) {
        ctx.filter = 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.7))';
      }

      let scaleY = 1 + Math.sin(this.idleTimer * 3) * 0.035;
      let scaleX = 1 - Math.sin(this.idleTimer * 3) * 0.035;

      if (this.isAnticipating) {
        scaleY *= 0.90;
        scaleX *= 1.08;
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
        ctx.roundRect(-80, -renderH, 160, 180, 24);
        ctx.fillStyle = this.rageMode ? '#EC4899' : '#0284C7';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Laser Aiming Guide Line (Telegraph)
      if (this.isLaserAiming) {
        ctx.save();
        const startX = 65;
        const startY = -95;
        const laserEnd = 850;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(laserEnd, startY);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.restore();
      }

      // Laser Beam Active (Overdrive Blast)
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
        ctx.lineWidth = 20 + Math.sin(this.idleTimer * 30) * 5;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(laserEnd, startY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 7;
        ctx.stroke();
      }

      ctx.restore();
    } catch (err) {
      console.error('[Boss] draw error:', err);
    }
  }
}
