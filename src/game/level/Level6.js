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
    const viewX = camera.x;
    const viewW = camera.viewportWidth;
    const viewH = camera.viewportHeight;

    const currentBiome = this.getCurrentBiome(viewX + viewW / 2);

    // 1. DYNAMIC ATMOSPHERIC SKY LAYER (Interpolated per Biome)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
    const cols = currentBiome.skyGradient;
    skyGrad.addColorStop(0, cols[0]);
    skyGrad.addColorStop(0.5, cols[1]);
    skyGrad.addColorStop(1, cols[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewW, viewH);

    // LAYER 1 (Distant Parallax 0.08): Frozen Aurora Peaks Horizon ('cielo6')
    const skyImg = imageLoader.getImage('cielo6');
    if (skyImg && skyImg.complete && skyImg.naturalWidth > 0) {
      const skyAspect = skyImg.naturalWidth / skyImg.naturalHeight;
      const skyRenderW = Math.round(viewH * skyAspect);
      const skyOffsetX = Math.round((viewX * 0.08) % skyRenderW);

      ctx.save();
      ctx.globalAlpha = 0.92;
      let startX = -skyOffsetX;
      while (startX < viewW) {
        ctx.drawImage(skyImg, startX, 0, skyRenderW + 1, viewH);
        startX += skyRenderW;
      }
      ctx.restore();
    }

    // LAYER 2 (Midground Parallax 0.28): Crystal Glacier Spires ('glaciar')
    const midImg = imageLoader.getImage('glaciar');
    if (midImg && midImg.complete && midImg.naturalWidth > 0) {
      const midAspect = midImg.naturalWidth / midImg.naturalHeight;
      const midH = Math.round(viewH * 0.75);
      const midRenderW = Math.round(midH * midAspect);
      const midOffsetX = Math.round((viewX * 0.28) % midRenderW);

      ctx.save();
      ctx.globalAlpha = 0.95;
      let startX = -midOffsetX;
      while (startX < viewW) {
        ctx.drawImage(midImg, startX, viewH - midH, midRenderW + 1, midH);
        startX += midRenderW;
      }
      ctx.restore();
    }

    // LAYER 3: Ambient Falling Snowflakes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 67 + this.animTime * 35) % (viewW + 40)) - 20;
      const sy = ((i * 43 + this.animTime * 85) % (viewH + 20)) - 10;
      const sr = (i % 3) + 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPlatforms(ctx, camera) {
    this.drawContinuousGround(ctx, camera);
    this.drawFloatingPlatforms(ctx, camera);
  }

  drawContinuousGround(ctx, camera) {
    const groundPlatforms = this.platforms.filter((p) => p.y >= 440);

    for (const plat of groundPlatforms) {
      const startX = plat.x;
      const endX = plat.x + plat.width;
      const topY = plat.y;
      const bottomY = this.height;

      if (endX < camera.x - 80 || startX > camera.x + camera.viewportWidth + 80) continue;

      const biome = this.getCurrentBiome(startX + plat.width / 2);

      ctx.save();

      // Organic Bezier Ground Path
      ctx.beginPath();
      ctx.moveTo(startX, bottomY);
      ctx.lineTo(startX, topY + 18);
      ctx.quadraticCurveTo(startX, topY, startX + 18, topY);

      const step = 40;
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.025) * 2.5;
        ctx.quadraticCurveTo(midX, topY + wave, nextX, topY);
      }

      ctx.lineTo(endX - 18, topY);
      ctx.quadraticCurveTo(endX, topY, endX, topY + 18);
      ctx.lineTo(endX, bottomY);
      ctx.closePath();

      const groundGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      if (plat.type === 'ice') {
        groundGrad.addColorStop(0, '#BAE6FD');
        groundGrad.addColorStop(0.3, '#38BDF8');
        groundGrad.addColorStop(1, '#0369A1');
      } else {
        const cols = biome.groundGradient;
        groundGrad.addColorStop(0, cols[0]);
        groundGrad.addColorStop(0.2, cols[1]);
        groundGrad.addColorStop(0.5, cols[2]);
        groundGrad.addColorStop(1, cols[3]);
      }
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // 3D Clay / Frost Texture Overlay
      const sueloImg = imageLoader.getImage('suelo');
      if (sueloImg && sueloImg.complete && sueloImg.naturalWidth > 0) {
        ctx.save();
        ctx.clip();
        ctx.globalAlpha = 0.45;
        const tileW = 140;
        const tileH = 80;
        for (let tx = startX; tx < endX; tx += tileW) {
          ctx.drawImage(sueloImg, tx, topY, tileW, tileH);
        }
        ctx.restore();
      }

      // Powdered Sugar Frosting Highlight
      ctx.beginPath();
      ctx.moveTo(startX + 6, topY + 4);
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.025) * 2.5;
        ctx.quadraticCurveTo(midX, topY + wave + 4, nextX, topY + 4);
      }
      ctx.strokeStyle = plat.type === 'ice' ? '#FFFFFF' : (biome.frostingColor || '#FFFFFF');
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();
    }
  }

  drawFloatingPlatforms(ctx, camera) {
    const barquilloImg = imageLoader.getImage('barquillo');
    const bastonImg = imageLoader.getImage('baston');
    const floating = this.platforms.filter((p) => p.y < 440);

    for (const plat of floating) {
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

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(plat.x, plat.y, plat.width, 5);
      }
      // WAFER PLATFORMS WITH 3D BISCUIT SPRITE
      else if (plat.type === 'wafer') {
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.fillStyle = '#78350F';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fill();
        }
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
        ctx.translate(0, sinkOffset);
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fillStyle = '#0284C7';
          ctx.fill();
        }
      }
      // CANDY CANE / ICICLE POLES
      else if (plat.type === 'candy_cane') {
        if (bastonImg && bastonImg.complete && bastonImg.naturalWidth > 0) {
          ctx.drawImage(bastonImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fillStyle = '#0369A1';
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }
}
