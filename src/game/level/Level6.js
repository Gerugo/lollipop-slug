import { LEVEL_6_CONFIG } from './Level6Config.js';
import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Destructible } from '../entities/Destructible.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Boss6 } from '../entities/Boss6.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level6 {
  constructor() {
    this.config = LEVEL_6_CONFIG;
    this.width = LEVEL_6_CONFIG.width;
    this.height = LEVEL_6_CONFIG.height;
    this.bossTriggerX = LEVEL_6_CONFIG.bossTriggerX;
    this.bossArenaLockX = LEVEL_6_CONFIG.bossArenaLockX;
    this.platforms = LEVEL_6_CONFIG.platforms;
    this.biomes = LEVEL_6_CONFIG.biomes;
    this.animTime = 0;
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
    return new Boss6({
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

    // LAYER 1: Distant Candy Mountain & Aurora Borealis Parallax (factor: 0.15)
    const bgSky = imageLoader.getImage('cielo6');
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

    // LAYER 2: Crystal Glacier Spires Parallax (factor: 0.40)
    const bgGlacier = imageLoader.getImage('glaciar');
    if (bgGlacier && bgGlacier.complete && bgGlacier.naturalWidth > 0) {
      const imgW = bgGlacier.naturalWidth;
      const imgH = bgGlacier.naturalHeight;
      const scale = 0.9;
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const factor = 0.40;
      const offsetX = -(camera.x * factor) % drawW;
      const offsetY = vpH - drawH;

      for (let x = offsetX - drawW; x < vpW + drawW; x += drawW) {
        ctx.drawImage(bgGlacier, x, offsetY, drawW, drawH);
      }
    }

    // LAYER 3: Ambient Falling Snowflakes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 67 + this.animTime * 35) % (vpW + 40)) - 20;
      const sy = ((i * 43 + this.animTime * 85) % (vpH + 20)) - 10;
      const sr = (i % 3) + 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPlatforms(ctx, camera) {
    for (const plat of this.platforms) {
      if (!camera.isVisible(plat.x, plat.y - 20, plat.width, plat.height + 40)) continue;

      ctx.save();

      // SLIPPERY ICE PLATFORMS
      if (plat.type === 'ice') {
        const iceGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        iceGrad.addColorStop(0, '#BAE6FD');
        iceGrad.addColorStop(0.3, '#38BDF8');
        iceGrad.addColorStop(1, '#0369A1');

        ctx.fillStyle = iceGrad;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, [6, 6, 0, 0]);
        ctx.fill();

        // Crystal frost top sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(plat.x, plat.y, plat.width, 6);

        // Ice crystal specular streaks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        for (let x = plat.x + 15; x < plat.x + plat.width - 20; x += 45) {
          ctx.beginPath();
          ctx.moveTo(x, plat.y + 4);
          ctx.lineTo(x + 18, plat.y + 16);
          ctx.stroke();
        }
      }
      // SOLID SNOW / SUGAR GROUND
      else if (plat.type === 'ground') {
        const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        groundGrad.addColorStop(0, '#E0F2FE');
        groundGrad.addColorStop(0.3, '#BAE6FD');
        groundGrad.addColorStop(1, '#0284C7');

        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Pure white sugar snow top
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(plat.x, plat.y, plat.width, 10);

        // Snow scallops
        for (let x = plat.x; x < plat.x + plat.width; x += 24) {
          ctx.beginPath();
          ctx.arc(x + 12, plat.y + 10, 6, 0, Math.PI);
          ctx.fillStyle = '#F0F9FF';
          ctx.fill();
        }
      }
      // WAFER PLATFORMS
      else if (plat.type === 'wafer') {
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fill();
        ctx.strokeStyle = '#FDE68A';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF'; // Powdered snow on top
        ctx.fillRect(plat.x + 2, plat.y + 1, plat.width - 4, 3);
      }
      // BOUNCE CANDY TRAMPOLINES
      else if (plat.type === 'bounce') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#BAE6FD';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(plat.x + plat.width / 2, plat.y + 5, plat.width * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
      }
      // SINKING PLATFORMS
      else if (plat.type === 'sinking') {
        const sinkOffset = plat.sinkOffset || 0;
        ctx.save();
        ctx.translate(0, sinkOffset);

        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fillStyle = '#0284C7';
        ctx.fill();
        ctx.strokeStyle = '#BAE6FD';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
      // CANDY CANE / ICICLE POLES
      else if (plat.type === 'candy_cane') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
        ctx.fillStyle = '#0369A1';
        ctx.fill();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
