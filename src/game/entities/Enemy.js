import { Projectile } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Enemy {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.prevY = this.y;
    this.type = options.type || 'GUMMY'; // 'GUMMY', 'TURRET', 'DRONE', 'GLOBO', 'PEZ'
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
    } else {
      this.type = 'GUMMY';
    }
  }

  takeDamage(amount, particles, soundManager, attackerX = 0) {
    this.hp -= amount;
    this.hurtTimer = 0.08;
    this.hitWobble = 0.18; // Flan wobble on hit
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

    // 1. PEZ (Sinusoidal wavy flight with banking angle)
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

    // 2. GLOBO (High altitude balloon bomber with floating bobbing & bank tilt)
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

    // 4. GUMMY SOLDIER (Metal Slug AI with 2-shot bursts)
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
    if (this.type !== 'PEZ' && this.type !== 'DRONE' && this.type !== 'GLOBO') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, bottomY + 2, 16, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
      ctx.fill();
      ctx.restore();
    }

    // --- PEZ PNG SPRITE (Center Pivot) ---
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

    // --- GLOBO PNG SPRITE (Center Pivot) ---
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

    // --- TURRET ---
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

    // --- GUMMY BEAR SOLDIER (Bottom-Center Pivot with Flan Wobble) ---
    const isWalking = Math.abs(this.vx) > 5;
    const bounceY = (isWalking && this.isGrounded) ? Math.abs(Math.sin(this.animTime * 12)) * 4 : Math.sin(this.animTime * 3) * 1.5;

    let scaleX = isWalking ? (1 + Math.sin(this.animTime * 12) * 0.08) : (1 - Math.sin(this.animTime * 3) * 0.03);
    let scaleY = isWalking ? (1 - Math.sin(this.animTime * 12) * 0.08) : (1 + Math.sin(this.animTime * 3) * 0.03);

    // Impact Spring Oscillation (Flan effect)
    if (this.hitWobble > 0) {
      const wobble = Math.sin(this.wobblePhase) * this.hitWobble;
      scaleX += wobble;
      scaleY -= wobble;
    }

    ctx.translate(cx, bottomY - bounceY);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.5) contrast(1.4)';
    }

    ctx.scale(this.facing * scaleX, scaleY);

    const gummySprite = imageLoader.getImage('gummybear');
    const renderW = 46;
    const renderH = 52;

    if (gummySprite && gummySprite.complete && gummySprite.naturalWidth > 0) {
      // Anchored at bottom-center: (-renderW / 2, -renderH)
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
