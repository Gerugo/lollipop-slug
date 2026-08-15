import { LEVEL_5_CONFIG } from './Level5Config.js';
import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Destructible } from '../entities/Destructible.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Boss5 } from '../entities/Boss5.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level5 {
  constructor() {
    this.config = LEVEL_5_CONFIG;
    this.width = LEVEL_5_CONFIG.width;
    this.height = LEVEL_5_CONFIG.height;
    this.bossTriggerX = LEVEL_5_CONFIG.bossTriggerX;
    this.bossArenaLockX = LEVEL_5_CONFIG.bossArenaLockX;
    this.platforms = LEVEL_5_CONFIG.platforms;
    this.biomes = LEVEL_5_CONFIG.biomes;
    this.animTime = 0;
    this.tideLevel = 0; // Oscillating soda swamp tide
  }

  createEnemies() {
    return this.config.enemies.map(cfg => new Enemy(cfg));
  }

  createHostages() {
    return this.config.hostages.map(cfg => new Hostage(cfg));
  }

  createDestructibles() {
    return this.config.destructibles.map(cfg => new Destructible(cfg));
  }

  createVehicle() {
    if (!this.config.vehicle) return null;
    return new SlugVehicle(this.config.vehicle.x, this.config.vehicle.y);
  }

  createBoss() {
    if (!this.config.boss) return null;
    return new Boss5({
      x: this.config.boss.x,
      y: this.config.boss.y,
      hp: this.config.boss.hp,
      arenaLeft: this.bossArenaLockX,
      arenaRight: this.width
    });
  }

  getCurrentBiome(worldX) {
    for (const biome of this.biomes) {
      if (worldX >= biome.startX && worldX < biome.endX) {
        return biome;
      }
    }
    return this.biomes[this.biomes.length - 1];
  }

  update(dt) {
    this.animTime += dt;
    // Rising & falling soda tide (oscillates by +/- 18px every 5s)
    this.tideLevel = Math.sin(this.animTime * 1.25) * 16;
  }

  drawBackground(ctx, camera) {
    const vpW = camera.viewportWidth;
    const vpH = camera.viewportHeight;

    const biome = this.getCurrentBiome(camera.x + vpW / 2);
    const grad = ctx.createLinearGradient(0, 0, 0, vpH);
    grad.addColorStop(0, biome.skyGradient[0]);
    grad.addColorStop(0.55, biome.skyGradient[1]);
    grad.addColorStop(1, biome.skyGradient[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, vpW, vpH);

    // LAYER 1: Distant Fizzy Swamp Parallax (factor: 0.15)
    const bgSky = imageLoader.getImage('cielo5');
    if (bgSky && bgSky.complete && bgSky.naturalWidth > 0) {
      const imgW = bgSky.naturalWidth;
      const imgH = bgSky.naturalHeight;
      const scale = vpH / imgH;
      const drawW = imgW * scale;
      const factor = 0.15;
      const offsetX = -(camera.x * factor) % drawW;

      for (let x = offsetX - drawW; x < vpW + drawW; x += drawW) {
        ctx.drawImage(bgSky, x, 0, drawW, vpH);
      }
    }

    // LAYER 2: Swamp Reeds & Glowing Bubbles Parallax (factor: 0.40)
    const bgCanas = imageLoader.getImage('pantano');
    if (bgCanas && bgCanas.complete && bgCanas.naturalWidth > 0) {
      const imgW = bgCanas.naturalWidth;
      const imgH = bgCanas.naturalHeight;
      const scale = 0.9;
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const factor = 0.40;
      const offsetX = -(camera.x * factor) % drawW;
      const offsetY = vpH - drawH;

      for (let x = offsetX - drawW; x < vpW + drawW; x += drawW) {
        ctx.drawImage(bgCanas, x, offsetY, drawW, drawH);
      }
    }

    // Ambient floating soda mist
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.fillRect(0, vpH - 140, vpW, 140);
  }

  drawPlatforms(ctx, camera) {
    for (const plat of this.platforms) {
      if (!camera.isVisible(plat.x, plat.y - 30, plat.width, plat.height + 60)) continue;

      ctx.save();

      // SODA TIDE HAZARD POOL
      if (plat.type === 'soda_tide') {
        const poolGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        poolGrad.addColorStop(0, '#06B6D4');
        poolGrad.addColorStop(0.4, '#0D9488');
        poolGrad.addColorStop(1, '#042F2E');

        ctx.fillStyle = poolGrad;
        ctx.fillRect(plat.x, plat.y + this.tideLevel * 0.5, plat.width, plat.height);

        // Effervescent surface foam
        ctx.strokeStyle = '#A5F3FC';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = plat.x; x <= plat.x + plat.width; x += 16) {
          const waveY = plat.y + this.tideLevel * 0.5 + Math.sin((x + this.animTime * 80) * 0.05) * 4;
          if (x === plat.x) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();

        // Carbonated popping bubble particles
        for (let b = 0; b < 3; b++) {
          const bx = plat.x + ((plat.width * (b + 1) / 4 + this.animTime * 30) % plat.width);
          const by = plat.y + this.tideLevel * 0.5 - 4 - (Math.sin(this.animTime * 4 + b) * 8);
          ctx.beginPath();
          ctx.arc(bx, by, 3 + b, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(165, 243, 252, 0.6)';
          ctx.fill();
        }
      }
      // SOLID GROUND
      else if (plat.type === 'ground') {
        const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        groundGrad.addColorStop(0, '#0F766E');
        groundGrad.addColorStop(0.3, '#115E59');
        groundGrad.addColorStop(1, '#042F2E');

        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Swamp Moss & Frosting on Top Surface
        ctx.fillStyle = '#5EEAD4';
        ctx.beginPath();
        ctx.rect(plat.x, plat.y, plat.width, 8);
        ctx.fill();

        // Dripping moss scallops
        for (let x = plat.x; x < plat.x + plat.width; x += 28) {
          ctx.beginPath();
          ctx.arc(x + 14, plat.y + 8, 7, 0, Math.PI);
          ctx.fillStyle = '#2DD4BF';
          ctx.fill();
        }
      }
      // WAFER / WOODEN LOG PLATFORMS
      else if (plat.type === 'wafer') {
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fill();
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FDE68A';
        ctx.fillRect(plat.x + 4, plat.y + 2, plat.width - 8, 4);
      }
      // BOUNCE BUBBLE TRAMPOLINES
      else if (plat.type === 'bounce') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.75)';
        ctx.fill();
        ctx.strokeStyle = '#67E8F9';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Shiny bubble shine
        ctx.beginPath();
        ctx.ellipse(plat.x + plat.width / 2, plat.y + 6, plat.width * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }
      // SINKING LILYPAD PLATFORMS
      else if (plat.type === 'sinking') {
        const sinkOffset = plat.sinkOffset || 0;
        ctx.save();
        ctx.translate(0, sinkOffset);

        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fillStyle = '#059669';
        ctx.fill();
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
      // CANDY CANE / VINE POLES
      else if (plat.type === 'candy_cane') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
        ctx.fillStyle = '#0D9488';
        ctx.fill();
        ctx.strokeStyle = '#99F6E4';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
