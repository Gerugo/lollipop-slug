import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Destructible {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 54;
    this.height = options.height || 64;
    this.hp = options.hp || 50;
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
      particles.emitExplosionSprite(this.x + this.width / 2, this.y + this.height / 2, 1.0);
      particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 15, '#EF4444');
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 18);
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 6, '#FDE68A');
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

    // Ground Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, bottomY + 2, this.width * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fill();
    ctx.restore();

    ctx.translate(cx, bottomY);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    const obsSprite = imageLoader.getImage('obstaculo') || imageLoader.getImage('barricada');
    const renderW = this.width + 8;
    const renderH = this.height + 6;

    if (obsSprite && obsSprite.complete && obsSprite.naturalWidth > 0) {
      ctx.drawImage(obsSprite, -renderW / 2, -renderH, renderW, renderH);
    } else {
      // Fallback
      ctx.beginPath();
      ctx.roundRect(-renderW / 2, -renderH, renderW, renderH, 8);
      ctx.fillStyle = '#78350F';
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
}
