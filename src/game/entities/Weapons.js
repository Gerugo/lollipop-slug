import { imageLoader } from '../engine/ImageLoader.js';

export const WEAPON_TYPES = {
  PISTOL: {
    id: 'PISTOL',
    name: 'Pistola de Chicles',
    shortName: 'GUM PISTOL',
    ammo: Infinity,
    fireRate: 0.18,
    iconColor: '#FF77B0',
    description: 'Bolas de chicle dulces con munición infinita.'
  },
  HMG: {
    id: 'HMG',
    name: 'Heavy Marshmallow Gun',
    shortName: 'H.M.G.',
    ammo: 200,
    fireRate: 0.08,
    iconColor: '#FFFFFF',
    description: 'Ráfaga ultra rápida de nubes de azúcar comprimidas.'
  },
  SHOTGUN: {
    id: 'SHOTGUN',
    name: 'Shot-Gum',
    shortName: 'SHOT-GUM',
    ammo: 30,
    fireRate: 0.55,
    iconColor: '#52C4FF',
    description: 'Dispersión destructiva de plátanos y caramelos.'
  },
  ROCKET: {
    id: 'ROCKET',
    name: 'Rocket Popsicle',
    shortName: 'ROCKET',
    ammo: 15,
    fireRate: 0.45,
    iconColor: '#FFDF6D',
    description: 'Misiles en forma de polo con explosión de sirope pegajoso.'
  }
};

export class Projectile {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.type = options.type || 'PISTOL';
    this.damage = options.damage || 10;
    this.width = options.width || 14;
    this.height = options.height || 14;
    this.isPlayer = options.isPlayer !== undefined ? options.isPlayer : true;
    this.life = options.life || 2.5;
    this.maxLife = this.life;
    this.penetrate = options.penetrate || false;
    this.hitEntities = new Set();
    this.rotation = options.rotation || 0;
    this.rotSpeed = options.rotSpeed || (this.type === 'SHOTGUN' ? 12 : (this.type === 'CANDY_CANE' ? 14 : 0));
    this.color = options.color || '#FF77B0';
    this.trailTimer = 0;
    this.gravity = options.gravity || (this.type === 'GUMBALL' ? 420 : (this.type === 'CANDY_CANE' ? 220 : 0));
    this.bounces = options.bounces !== undefined ? options.bounces : (this.type === 'GUMBALL' ? 3 : 0);
  }

  update(dt, particles, platforms = []) {
    this.life -= dt;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotSpeed * dt;

    // Platform bounce for Gumballs
    if (this.bounces > 0 && platforms && platforms.length > 0) {
      for (const plat of platforms) {
        if (
          this.x + this.width > plat.x &&
          this.x < plat.x + plat.width &&
          this.y + this.height >= plat.y &&
          this.y + this.height <= plat.y + 16 &&
          this.vy > 0
        ) {
          this.y = plat.y - this.height;
          this.vy = -this.vy * 0.7;
          this.bounces--;
          if (particles) {
            particles.emitSodaBubbles(this.x + this.width / 2, this.y + this.height, 3);
          }
        }
      }
    }

    this.trailTimer += dt;
    if (this.trailTimer > 0.04) {
      this.trailTimer = 0;
      if (particles) {
        if (this.type === 'HMG') {
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 1, 'rgba(255, 255, 255, 0.7)');
        } else if (this.type === 'ROCKET') {
          particles.emitSugarSmoke(this.x, this.y + this.height / 2, 2, 'rgba(255, 223, 109, 0.8)');
        } else if (this.type === 'SHOTGUN') {
          particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 1, '#FDE047');
        } else if (this.type === 'CANDY_CANE') {
          particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 1, '#F43F5E');
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    if (this.type === 'PISTOL') {
      // Pink glossy bubblegum sphere
      const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, '#FF94C2');
      grad.addColorStop(1, '#E63980');

      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.type === 'HMG') {
      ctx.rotate(this.rotation);
      ctx.beginPath();
      ctx.roundRect(-8, -5, 16, 10, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#F3E8FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-2, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFB6D9';
      ctx.fill();
    } else if (this.type === 'SHOTGUN') {
      // Spinning Banana Projectile ('platano.png')
      ctx.rotate(this.rotation);
      const platanoSprite = imageLoader.getImage('platano');
      if (platanoSprite && platanoSprite.complete && platanoSprite.naturalWidth > 0) {
        ctx.drawImage(platanoSprite, -11, -11, 22, 22);
      } else {
        ctx.beginPath();
        ctx.moveTo(-6, -6);
        ctx.lineTo(8, 0);
        ctx.lineTo(-4, 6);
        ctx.closePath();
        ctx.fillStyle = '#FBBF24';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }
    } else if (this.type === 'ROCKET') {
      const angle = Math.atan2(this.vy, this.vx);
      ctx.rotate(angle);

      ctx.fillStyle = '#FDE68A';
      ctx.fillRect(-14, -2, 8, 4);

      ctx.beginPath();
      ctx.roundRect(-8, -6, 20, 12, [0, 6, 6, 0]);
      const grad = ctx.createLinearGradient(-8, 0, 12, 0);
      grad.addColorStop(0, '#FF3388');
      grad.addColorStop(0.5, '#FFDF6D');
      grad.addColorStop(1, '#70D6FF');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (this.type === 'ENEMY_BULLET') {
      const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 6);
      grad.addColorStop(0, '#FF9999');
      grad.addColorStop(0.4, '#EF4444');
      grad.addColorStop(1, '#991B1B');

      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#FCA5A5';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.type === 'GUMBALL') {
      // Bouncing Rainbow Gumball
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = this.color || '#F59E0B';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-3, -3, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();
    } else if (this.type === 'CANDY_CANE') {
      // Spinning Boomerang Candy Cane
      ctx.rotate(this.rotation);
      ctx.beginPath();
      ctx.roundRect(-4, -14, 8, 28, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Candy cane hook
      ctx.beginPath();
      ctx.arc(4, -10, 6, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.restore();
  }
}

export class Grenade {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.radius = 12;
    this.timer = 0.85;
    this.maxTimer = this.timer;
    this.bounces = 0;
    this.maxBounces = 3;
    this.exploded = false;
    this.damage = 130;
    this.explosionRadius = 120;
    this.rotation = 0;
    this.fizzCounter = 0;
  }

  update(dt, platforms, particles, soundManager) {
    if (this.exploded) return;

    this.timer -= dt;
    this.rotation += 10 * dt;

    this.vy += 650 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.fizzCounter += dt;
    if (this.fizzCounter > 0.05) {
      this.fizzCounter = 0;
      particles.emitSodaBubbles(this.x, this.y, 2);
      if (Math.random() < 0.3) {
        soundManager.playSodaGrenadeFizz();
      }
    }

    for (const plat of platforms) {
      if (
        this.x + this.radius > plat.x &&
        this.x - this.radius < plat.x + plat.width &&
        this.y + this.radius >= plat.y &&
        this.y - this.radius <= plat.y + 16 &&
        this.vy > 0
      ) {
        this.y = plat.y - this.radius;
        this.vy = -this.vy * 0.55;
        this.vx *= 0.75;
        this.bounces++;
        particles.emitSodaBubbles(this.x, this.y, 4);
      }
    }

    if (this.timer <= 0) {
      this.explode(particles, soundManager);
    }
  }

  explode(particles, soundManager) {
    if (this.exploded) return;
    this.exploded = true;
    soundManager.playExplosion();
    particles.emitShockwave(this.x, this.y, this.explosionRadius, '#EF4444');
    particles.emitSodaBubbles(this.x, this.y, 35);
    particles.emitCandyShards(this.x, this.y, 22);
    particles.emitSugarSmoke(this.x, this.y, 12, 'rgba(239, 68, 68, 0.7)');
  }

  draw(ctx) {
    if (this.exploded) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Apple Grenade ('manzana.png')
    const appleSprite = imageLoader.getImage('manzana');
    if (appleSprite && appleSprite.complete && appleSprite.naturalWidth > 0) {
      ctx.drawImage(appleSprite, -13, -13, 26, 26);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }
}
