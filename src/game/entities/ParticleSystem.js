import { imageLoader } from '../engine/ImageLoader.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500;
  }

  emitExplosionSprite(x, y, maxScale = 1.0) {
    this.particles.push({
      type: 'explosion_sprite',
      x,
      y,
      scale: 0.3,
      maxScale,
      life: 0.35,
      maxLife: 0.35
    });
  }

  emitConfetti(x, y, count = 30) {
    const colors = ['#FF77B0', '#70D6FF', '#FFDF6D', '#7AE582', '#C084FC', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 120 + Math.random() * 260;
      this.particles.push({
        type: 'confetti',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 150,
        gravity: 380,
        drag: 0.98,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 6 + Math.random() * 4,
        height: 4 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1.2 + Math.random() * 0.8,
        maxLife: 2.0
      });
    }
  }

  emitSugarSmoke(x, y, count = 8, color = 'rgba(255, 255, 255, 0.85)') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 60;
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        gravity: -20,
        drag: 0.94,
        radius: 6 + Math.random() * 8,
        growth: 12,
        color,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7
      });
    }
  }

  emitSodaBubbles(x, y, count = 25) {
    const colors = ['#38BDF8', '#70D6FF', '#99F6E4', '#FFFFFF', '#FF77B0'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.5;
      const speed = 80 + Math.random() * 220;
      this.particles.push({
        type: 'bubble',
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 280,
        drag: 0.97,
        radius: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.6 + Math.random() * 0.5,
        maxLife: 1.1
      });
    }
  }

  emitSyrupSplash(x, y, count = 20, color = '#EF4444') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 200;
      this.particles.push({
        type: 'syrup',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        gravity: 420,
        drag: 0.96,
        radius: 4 + Math.random() * 6,
        color,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0
      });
    }
  }

  emitSparkles(x, y, count = 12, color = '#FFDF6D') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        type: 'sparkle',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 100,
        drag: 0.95,
        size: 8 + Math.random() * 6,
        color,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8
      });
    }
  }

  emitCandyShards(x, y, count = 15) {
    const colors = ['#FF5A9E', '#5CD86E', '#52C4FF', '#FFD633', '#C084FC'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 240;
      this.particles.push({
        type: 'shard',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        gravity: 450,
        drag: 0.97,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 16,
        life: 0.7 + Math.random() * 0.5,
        maxLife: 1.2
      });
    }
  }

  emitShockwave(x, y, maxRadius = 80, color = 'rgba(255, 119, 176, 0.8)') {
    this.particles.push({
      type: 'shockwave',
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      life: 0.35,
      maxLife: 0.35
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'explosion_sprite') {
        const progress = 1 - p.life / p.maxLife;
        p.scale = 0.3 + progress * (p.maxScale - 0.3);
        continue;
      }

      if (p.type === 'shockwave') {
        const progress = 1 - p.life / p.maxLife;
        p.radius = 5 + progress * (p.maxRadius - 5);
        continue;
      }

      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
      p.vy += p.gravity * dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.rotSpeed) {
        p.rot += p.rotSpeed * dt;
      }
      if (p.growth) {
        p.radius += p.growth * dt;
      }
    }

    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles);
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'explosion_sprite') {
        const expImg = imageLoader.getImage('explosion');
        ctx.translate(p.x, p.y);
        ctx.scale(p.scale, p.scale);

        if (expImg && expImg.complete && expImg.naturalWidth > 0) {
          const w = 90;
          const h = 90;
          ctx.drawImage(expImg, -w / 2, -h / 2, w, h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 35, 0, Math.PI * 2);
          ctx.fillStyle = '#EF4444';
          ctx.fill();
        }
      } else if (p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'bubble') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      } else if (p.type === 'syrup') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'shard') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.8, p.size * 0.8);
        ctx.lineTo(-p.size * 0.8, p.size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else if (p.type === 'shockwave') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * alpha;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
  }
}
