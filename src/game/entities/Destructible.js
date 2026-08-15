import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Destructible {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 46;
    this.height = options.height || 58;
    this.hp = options.hp || 45;
    this.maxHp = this.hp;
    this.dead = false;
    this.hurtTimer = 0;
    this.dropType = options.dropType || 'ESTRELLA';
  }

  takeDamage(amount, particles, soundManager, drops) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 0.1;
    soundManager.playEnemyPop();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 6);
    }

    if (this.hp <= 0) {
      this.destroy(particles, soundManager, drops);
    }
  }

  destroy(particles, soundManager, drops) {
    this.dead = true;
    soundManager.playExplosion();

    if (particles) {
      particles.emitExplosionSprite(this.x + this.width / 2, this.y + this.height / 2, 1.1);
      particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 20, '#451A03');
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 20);
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 8, '#78350F');
    }

    // Drop reward
    if (drops) {
      drops.push({
        x: this.x + this.width / 2 - 13,
        y: this.y + 10,
        vx: (Math.random() - 0.5) * 60,
        vy: -180,
        type: this.dropType,
        collected: false,
        timer: 0,
        width: 26,
        height: 26
      });
    }
  }

  update(dt) {
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // Ground Shadow right under barrel base
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, bottomY + 1, 20, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
    ctx.fill();
    ctx.restore();

    ctx.translate(cx, bottomY + 1);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    const obsSprite = imageLoader.getImage('bidon') || imageLoader.getImage('barricada');
    const renderW = 46;
    const renderH = 58;

    if (obsSprite && obsSprite.complete && obsSprite.naturalWidth > 0) {
      ctx.drawImage(obsSprite, -renderW / 2, -renderH, renderW, renderH);
    } else {
      // Fallback
      ctx.beginPath();
      ctx.roundRect(-renderW / 2, -renderH, renderW, renderH, 8);
      ctx.fillStyle = '#451A03';
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
}
