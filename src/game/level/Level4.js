import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Boss4 } from '../entities/Boss4.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Destructible } from '../entities/Destructible.js';
import { imageLoader } from '../engine/ImageLoader.js';
import { LEVEL_4_CONFIG } from './Level4Config.js';

export class Level4 {
  constructor() {
    this.config = LEVEL_4_CONFIG;
    this.width = this.config.width;
    this.height = this.config.height;
    this.bossTriggerX = this.config.bossTriggerX;
    this.bossArenaLockX = this.config.bossArenaLockX;

    // Load platforms from data configuration
    this.platforms = JSON.parse(JSON.stringify(this.config.platforms));

    this.animTime = 0;
  }

  createEnemies() {
    return this.config.enemies.map((e) => {
      const enemy = new Enemy(e);
      enemy.hp = Math.floor(enemy.hp * 1.45);
      return enemy;
    });
  }

  createHostages() {
    return this.config.hostages.map((h) => new Hostage(h));
  }

  createDestructibles() {
    return this.config.destructibles.map((d) => new Destructible(d));
  }

  createVehicle() {
    return new SlugVehicle(this.config.vehicle.x, this.config.vehicle.y);
  }

  createBoss() {
    return new Boss4(this.config.boss.x, this.config.boss.y);
  }

  getCurrentBiome(worldX) {
    for (const biome of this.config.biomes) {
      if (worldX >= biome.startX && worldX < biome.endX) {
        return biome;
      }
    }
    return this.config.biomes[0];
  }

  update(dt) {
    this.animTime += dt;
  }

  // --- 3-LAYER HIGH PERFORMANCE PARALLAX & BIOME SYSTEM ---
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

    // LAYER 1 (Distant Parallax 0.08): Licorice Forest Background ('cielo4')
    const skyImg = imageLoader.getImage('cielo4');
    if (skyImg && skyImg.complete && skyImg.naturalWidth > 0) {
      const skyAspect = skyImg.naturalWidth / skyImg.naturalHeight;
      const skyRenderW = Math.round(viewH * skyAspect);
      const skyOffsetX = Math.round((viewX * 0.08) % skyRenderW);

      ctx.save();
      ctx.globalAlpha = 0.95;
      let startX = -skyOffsetX;
      while (startX < viewW) {
        ctx.drawImage(skyImg, startX, 0, skyRenderW + 1, viewH);
        startX += skyRenderW;
      }
      ctx.restore();
    }

    // LAYER 2 (Midground Parallax 0.28): Licorice Root Arches & Acid Syrup ('regaliz')
    const midImg = imageLoader.getImage('regaliz');
    if (midImg && midImg.complete && midImg.naturalWidth > 0) {
      const midH = Math.round(viewH * 0.78);
      const midAspect = midImg.naturalWidth / midImg.naturalHeight;
      const midRenderW = Math.round(midH * midAspect);
      const midOffsetX = Math.round((viewX * 0.28) % midRenderW);
      const midY = viewH - midH + 20;

      ctx.save();
      ctx.globalAlpha = 0.88;
      let startX = -midOffsetX;
      while (startX < viewW) {
        ctx.drawImage(midImg, startX, midY, midRenderW + 1, midH);
        startX += midRenderW;
      }
      ctx.restore();
    }
  }

  // --- CONTINUOUS ORGANIC CLAY GROUND & PLATFORMS RENDERER ---
  drawPlatforms(ctx, camera) {
    const viewLeft = camera.x - 100;
    const viewRight = camera.x + camera.viewportWidth + 100;

    // 1. Draw Continuous Licorice Ground with Wave Top
    this.drawContinuousGround(ctx, viewLeft, viewRight);

    // 2. Draw Floating & Special Interactive Platforms
    for (const plat of this.platforms) {
      if (plat.type === 'ground') continue;
      if (plat.x + plat.width < viewLeft || plat.x > viewRight) continue;

      const platY = plat.y + (plat.sinkY || 0);

      ctx.save();

      // Platform Shadow
      ctx.beginPath();
      ctx.roundRect(plat.x + 4, platY + 8, plat.width - 8, plat.height - 4, 8);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fill();

      // --- PLATFORM TYPE STYLING ---
      if (plat.type === 'sticky') {
        // Sticky Licorice Root platform (Dark charcoal with dripping green syrup)
        ctx.beginPath();
        ctx.roundRect(plat.x, platY, plat.width, plat.height, 8);
        ctx.fillStyle = '#1C1917';
        ctx.fill();
        ctx.strokeStyle = '#44403C';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dripping green slime frosting
        ctx.beginPath();
        ctx.roundRect(plat.x, platY, plat.width, 7, [8, 8, 0, 0]);
        ctx.fillStyle = '#84CC16';
        ctx.fill();

        // Little green drops hanging
        for (let dx = 16; dx < plat.width - 10; dx += 28) {
          ctx.beginPath();
          ctx.arc(plat.x + dx, platY + 9, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#84CC16';
          ctx.fill();
        }
      } else if (plat.type === 'acid_pool') {
        // Glowing Corrosive Acid Pool Hazard
        const acidGrad = ctx.createLinearGradient(plat.x, platY, plat.x, platY + plat.height);
        acidGrad.addColorStop(0, '#A3E635');
        acidGrad.addColorStop(0.4, '#84CC16');
        acidGrad.addColorStop(1, '#15803D');

        ctx.beginPath();
        ctx.roundRect(plat.x, platY, plat.width, plat.height, 6);
        ctx.fillStyle = acidGrad;
        ctx.fill();

        // Bubbling surface waves
        ctx.beginPath();
        ctx.moveTo(plat.x, platY + 2);
        for (let bx = 0; bx <= plat.width; bx += 12) {
          const by = Math.sin((plat.x + bx + this.animTime * 140) * 0.08) * 3;
          ctx.lineTo(plat.x + bx, platY + 2 + by);
        }
        ctx.strokeStyle = '#ECFCCB';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (plat.type === 'elastic') {
        // Flexible Elastic Licorice Trampoline (bouncy spring)
        ctx.beginPath();
        ctx.roundRect(plat.x, platY, plat.width, plat.height, 8);
        ctx.fillStyle = '#15803D';
        ctx.fill();
        ctx.strokeStyle = '#86EFAC';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Bouncy neon top layer
        ctx.beginPath();
        ctx.roundRect(plat.x + 2, platY + 2, plat.width - 4, 6, 4);
        ctx.fillStyle = '#4ADE80';
        ctx.fill();

        // Spring arrows indicator
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲  BOUNCE  ▲', plat.x + plat.width / 2, platY + 18);
      } else if (plat.type === 'wafer') {
        // Crunchy Wafer Bar
        const waferSprite = imageLoader.getImage('barquillo');
        if (waferSprite && waferSprite.complete && waferSprite.naturalWidth > 0) {
          ctx.drawImage(waferSprite, plat.x, platY, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, platY, plat.width, plat.height, 6);
          ctx.fillStyle = '#D97706';
          ctx.fill();
        }
      } else if (plat.type === 'moving') {
        // Glowing Licorice Gear Platform
        ctx.beginPath();
        ctx.roundRect(plat.x, platY, plat.width, plat.height, 8);
        ctx.fillStyle = '#3B0764';
        ctx.fill();
        ctx.strokeStyle = '#C084FC';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(plat.x + 2, platY + 2, plat.width - 4, 6, 4);
        ctx.fillStyle = '#E879F9';
        ctx.fill();
      } else if (plat.type === 'sinking') {
        // Crumbling sweet wafer
        ctx.beginPath();
        ctx.roundRect(plat.x, platY, plat.width, plat.height, 6);
        ctx.fillStyle = '#BE185D';
        ctx.fill();
        ctx.strokeStyle = '#F472B6';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Draw continuous organic ground with wavy top curve & biome gradients
  drawContinuousGround(ctx, viewLeft, viewRight) {
    const step = 20;
    const startX = Math.floor(viewLeft / step) * step;
    const endX = Math.ceil(viewRight / step) * step;

    // Check which ground segments exist in view
    const groundPlats = this.platforms.filter((p) => p.type === 'ground');

    for (const gp of groundPlats) {
      if (gp.x + gp.width < viewLeft || gp.x > viewRight) continue;

      const segStart = Math.max(startX, gp.x);
      const segEnd = Math.min(endX, gp.x + gp.width);
      if (segEnd <= segStart) continue;

      const currentBiome = this.getCurrentBiome(gp.x + gp.width / 2);

      ctx.save();

      // 1. Solid Ground Body
      const groundGrad = ctx.createLinearGradient(0, gp.y, 0, gp.y + gp.height + 40);
      const gCols = currentBiome.groundGradient;
      groundGrad.addColorStop(0, gCols[0]);
      groundGrad.addColorStop(0.3, gCols[1]);
      groundGrad.addColorStop(0.7, gCols[2]);
      groundGrad.addColorStop(1, gCols[3]);

      ctx.beginPath();
      ctx.moveTo(segStart, gp.y + gp.height + 50);

      // Top wavy surface
      for (let x = segStart; x <= segEnd; x += step) {
        const wave = Math.sin(x * 0.04) * 3 + Math.cos(x * 0.08) * 2;
        ctx.lineTo(x, gp.y + wave);
      }

      ctx.lineTo(segEnd, gp.y + gp.height + 50);
      ctx.closePath();
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // 2. Thick Frosting / Syrup Wave Cap
      ctx.beginPath();
      for (let x = segStart; x <= segEnd; x += step) {
        const wave = Math.sin(x * 0.04) * 3 + Math.cos(x * 0.08) * 2;
        if (x === segStart) ctx.moveTo(x, gp.y + wave);
        else ctx.lineTo(x, gp.y + wave);
      }
      ctx.strokeStyle = currentBiome.frostingColor;
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.restore();
    }
  }
}
