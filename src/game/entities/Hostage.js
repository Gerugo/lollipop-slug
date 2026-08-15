import { WEAPON_TYPES } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Hostage {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.prevY = this.y;
    this.width = 38;
    this.height = 46;
    this.isRescued = false;
    this.rewardType = options.rewardType || 'HMG';
    this.animTime = Math.random() * 4;
    this.saluteTimer = 0;
    this.walkOffTimer = 0;
    this.facing = 1;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 900;
    this.isGrounded = false;
    this.vanished = false;
    this.spinAngle = 0;
  }

  rescue(particles, soundManager, drops) {
    if (this.isRescued) return;
    this.isRescued = true;
    this.saluteTimer = 1.4;
    this.vy = -340; // Happy celebratory jump
    this.isGrounded = false;

    soundManager.playHostageRescue();
    if (particles) {
      particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 30);
      particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 20);
    }

    // Drop reward crate or candy star bonus
    drops.push({
      x: this.x + 8,
      y: this.y + 10,
      vx: (Math.random() - 0.5) * 80,
      vy: -200,
      type: this.rewardType,
      collected: false,
      timer: 0,
      width: 26,
      height: 26
    });
  }

  update(dt, platforms, particles, soundManager, drops) {
    if (this.vanished) return;
    this.animTime += dt;
    this.prevY = this.y;

    if (this.isRescued) {
      if (this.saluteTimer > 0) {
        this.saluteTimer -= dt;
        // 360 spin during rescue celebration jump
        if (!this.isGrounded) {
          this.spinAngle += dt * 14;
        } else {
          this.spinAngle = 0;
        }
      } else {
        this.facing = -1;
        this.vx = -130;
        this.walkOffTimer += dt;
        if (this.walkOffTimer > 4.0) {
          this.vanished = true;
        }
      }
    }

    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.isGrounded = false;
    Physics.resolvePlatforms(this, platforms);
  }

  draw(ctx) {
    if (this.vanished) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // Ground Shadow right under paws
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, bottomY + 1, 14, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();
    ctx.restore();

    // Shiver vibration when waiting for rescue
    const shiverX = !this.isRescued ? Math.sin(this.animTime * 20) * 1.0 : 0;

    // Universal Bottom-Center Pivot anchored firmly on ground
    ctx.translate(cx + shiverX, bottomY + 1);
    if (this.isRescued && this.saluteTimer > 0 && !this.isGrounded) {
      ctx.rotate(this.spinAngle);
    }
    ctx.scale(this.facing, 1);

    const catSprite = imageLoader.getImage('gato');
    const renderW = 38;
    const renderH = 46;

    if (catSprite && catSprite.complete && catSprite.naturalWidth > 0) {
      // Draw Cat PNG anchored firmly at bottom-center: (-renderW / 2, -renderH)
      ctx.drawImage(catSprite, -renderW / 2, -renderH, renderW, renderH);
    } else {
      ctx.beginPath();
      ctx.arc(0, -renderH / 2, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
    }

    // Rescue Speech Badges & Sweet Ribbon
    if (!this.isRescued) {
      // "¡AYUDA!" badge with sweet candy styling
      const wave = Math.sin(this.animTime * 6);
      ctx.fillStyle = '#FF3388';
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('¡AYUDA!', 0, -renderH - 6 + wave * 2);
    } else {
      if (this.saluteTimer > 0) {
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('¡GRACIAS!', 0, -renderH - 8);
      }
    }

    ctx.restore();
  }
}
