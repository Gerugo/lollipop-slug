import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Boss } from '../entities/Boss.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Destructible } from '../entities/Destructible.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level1 {
  constructor() {
    // Extended World: 6000px (>6.25x viewport width)
    this.width = 6000;
    this.height = 540;
    this.bossTriggerX = 5000;

    // Logical collision platforms (ground and elevated one-way candy platforms)
    this.platforms = [
      // --- ZONE 1: Cotton Candy Meadows (x: 0 - 1480) ---
      { x: 0, y: 460, width: 860, height: 80, type: 'ground', isOneWay: false },
      { x: 920, y: 460, width: 560, height: 80, type: 'ground', isOneWay: false },

      { x: 240, y: 370, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 440, y: 290, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 680, y: 360, width: 150, height: 26, type: 'wafer', isOneWay: true },
      { x: 1000, y: 350, width: 160, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 1220, y: 280, width: 180, height: 26, type: 'wafer', isOneWay: true },

      // --- ZONE 2: Candy Cane Route & Aerial Outpost (x: 1480 - 3200) ---
      { x: 1540, y: 460, width: 900, height: 80, type: 'ground', isOneWay: false },
      { x: 2500, y: 460, width: 720, height: 80, type: 'ground', isOneWay: false },

      { x: 1580, y: 370, width: 150, height: 26, type: 'wafer', isOneWay: true },
      { x: 1780, y: 290, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 2020, y: 210, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 2240, y: 340, width: 160, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 2440, y: 300, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 2680, y: 360, width: 170, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 2900, y: 280, width: 190, height: 26, type: 'wafer', isOneWay: true },

      // --- ZONE 3: Candy Fortress Assault (x: 3200 - 4600) ---
      { x: 3280, y: 460, width: 1320, height: 80, type: 'ground', isOneWay: false },

      { x: 3340, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 3560, y: 280, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 3780, y: 200, width: 170, height: 26, type: 'wafer', isOneWay: true },
      { x: 4020, y: 280, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 4260, y: 350, width: 170, height: 26, type: 'wafer', isOneWay: true },
      { x: 4460, y: 270, width: 180, height: 26, type: 'candy_cane', isOneWay: true },

      // --- ZONE 4 & 5: Safe Prep Area & Final Boss Arena (x: 4600 - 6000) ---
      { x: 4640, y: 460, width: 1360, height: 80, type: 'ground', isOneWay: false },

      { x: 4780, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 5120, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 5360, y: 270, width: 190, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 5620, y: 350, width: 160, height: 26, type: 'wafer', isOneWay: true }
    ];
  }

  createEnemies() {
    return [
      // === ZONE 1: Warmup & Foot Soldiers (x: 0 - 1480) ===
      new Enemy({ x: 380, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 520, y: 240, type: 'GUMMY' }),
      new Enemy({ x: 620, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 740, y: 190, type: 'PEZ' }),
      new Enemy({ x: 1040, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 1280, y: 230, type: 'GUMMY' }),

      // === ZONE 2: Aerial Balloon Bombers & Turrets (x: 1480 - 3200) ===
      new Enemy({ x: 1640, y: 120, type: 'GLOBO' }),
      new Enemy({ x: 1720, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 1940, y: 180, type: 'PEZ' }),
      new Enemy({ x: 2040, y: 160, type: 'TURRET' }),
      new Enemy({ x: 2180, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 2560, y: 110, type: 'GLOBO' }),
      new Enemy({ x: 2640, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 2780, y: 180, type: 'PEZ' }),
      new Enemy({ x: 2920, y: 230, type: 'GUMMY' }),
      new Enemy({ x: 3040, y: 410, type: 'GUMMY' }),

      // === ZONE 3: Candy Fortress Heavy Assault (x: 3200 - 4600) ===
      new Enemy({ x: 3420, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 3520, y: 120, type: 'GLOBO' }),
      new Enemy({ x: 3600, y: 230, type: 'TURRET' }),
      new Enemy({ x: 3740, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 3880, y: 180, type: 'PEZ' }),
      new Enemy({ x: 4060, y: 230, type: 'GUMMY' }),
      new Enemy({ x: 4180, y: 110, type: 'GLOBO' }),
      new Enemy({ x: 4300, y: 300, type: 'TURRET' }),
      new Enemy({ x: 4380, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 4500, y: 220, type: 'GUMMY' })
    ];
  }

  createHostages() {
    return [
      // 5 Strategic Hostages scattered across elevated platforms
      new Hostage({ x: 480, y: 240, rewardType: 'HMG' }),
      new Hostage({ x: 1260, y: 230, rewardType: 'SHOTGUN' }),
      new Hostage({ x: 1840, y: 240, rewardType: 'ROCKET' }),
      new Hostage({ x: 2940, y: 230, rewardType: 'GRENADE' }),
      new Hostage({ x: 3820, y: 150, rewardType: 'ESTRELLA' })
    ];
  }

  createDestructibles() {
    return [
      new Destructible({ x: 800, y: 396, width: 54, height: 64, hp: 45, dropType: 'HMG' }),
      new Destructible({ x: 2100, y: 396, width: 54, height: 64, hp: 45, dropType: 'SHOTGUN' }),
      new Destructible({ x: 3840, y: 396, width: 54, height: 64, hp: 50, dropType: 'ROCKET' }),
      new Destructible({ x: 4720, y: 396, width: 54, height: 64, hp: 40, dropType: 'ESTRELLA' })
    ];
  }

  createVehicle() {
    // Tank placed midway in Zone 2 to breakthrough heavy fortified defenses
    return new SlugVehicle(2350, 390);
  }

  createBoss() {
    // Grand Gumball Mech Titan inside the final arena
    return new Boss(5680, 230);
  }

  // --- 2-LAYER PARALLAX BACKGROUND SYSTEM ---
  drawBackground(ctx, camera) {
    const viewX = camera.x;
    const viewW = camera.viewportWidth;
    const viewH = camera.viewportHeight;

    // LAYER 1: SKY WITH 3D SUN (fondo-cielo.jpg, scroll factor 0.05)
    const skyImg = imageLoader.getImage('cielo');
    if (skyImg && skyImg.complete && skyImg.naturalWidth > 0) {
      const skyAspect = skyImg.naturalWidth / skyImg.naturalHeight;
      const skyRenderW = viewH * skyAspect;
      const skyOffsetX = (viewX * 0.05) % skyRenderW;

      let startX = -skyOffsetX;
      while (startX < viewW) {
        ctx.drawImage(skyImg, startX, 0, skyRenderW + 1, viewH);
        startX += skyRenderW;
      }
    } else {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
      skyGrad.addColorStop(0, '#93C5FD');
      skyGrad.addColorStop(0.5, '#BAE6FD');
      skyGrad.addColorStop(1, '#FEF08A');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    // LAYER 2: CLAY ROLLING HILLS (fondo-colinas.jpg, scroll factor 0.35)
    const hillsImg = imageLoader.getImage('colinas');
    if (hillsImg && hillsImg.complete && hillsImg.naturalWidth > 0) {
      const hillsAspect = hillsImg.naturalWidth / hillsImg.naturalHeight;
      const hillsH = viewH * 0.74;
      const hillsRenderW = hillsH * hillsAspect;
      const hillsY = viewH - hillsH;
      const hillsOffsetX = (viewX * 0.35) % hillsRenderW;

      let startX = -hillsOffsetX;
      while (startX < viewW) {
        ctx.drawImage(hillsImg, startX, hillsY, hillsRenderW + 1, hillsH);
        startX += hillsRenderW;
      }
    }
  }

  // --- CONTINUOUS ORGANIC CLAY GROUND RENDERER WITH VIEWPORT CULLING ---
  drawPlatforms(ctx, camera) {
    this.drawContinuousGround(ctx, camera);
    this.drawFloatingPlatforms(ctx, camera);
  }

  drawContinuousGround(ctx, camera) {
    const groundPlatforms = this.platforms.filter((p) => p.type === 'ground');

    for (const plat of groundPlatforms) {
      const startX = plat.x;
      const endX = plat.x + plat.width;
      const topY = plat.y;
      const bottomY = this.height;

      // Strict Viewport Culling
      if (endX < camera.x - 80 || startX > camera.x + camera.viewportWidth + 80) {
        continue;
      }

      ctx.save();

      // 1. Single Continuous Organic Bezier Ground Path
      ctx.beginPath();
      ctx.moveTo(startX, bottomY);
      ctx.lineTo(startX, topY + 18);
      // Smooth rounded cliff top-left
      ctx.quadraticCurveTo(startX, topY, startX + 18, topY);

      // Smooth flowing top edge with subtle organic clay undulations
      const step = 40;
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.025) * 2.5;
        ctx.quadraticCurveTo(midX, topY + wave, nextX, topY);
      }

      // Smooth rounded cliff top-right
      ctx.lineTo(endX - 18, topY);
      ctx.quadraticCurveTo(endX, topY, endX, topY + 18);
      ctx.lineTo(endX, bottomY);
      ctx.closePath();

      // 2. Rich Continuous Pastel Clay Gradient Fill
      const groundGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      groundGrad.addColorStop(0, '#4ADE80');    // Soft Mint Pastel Top
      groundGrad.addColorStop(0.15, '#22C55E');  // Candy Green
      groundGrad.addColorStop(0.45, '#16A34A');  // Deep Clay Dough
      groundGrad.addColorStop(0.8, '#15803D');   // Shadowed Base
      groundGrad.addColorStop(1, '#14532D');     // Deepest Earth
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // 3. Marshmallow Frosting / Glaze Highlight on Top Surface
      ctx.beginPath();
      ctx.moveTo(startX + 6, topY + 4);
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.025) * 2.5;
        ctx.quadraticCurveTo(midX, topY + wave + 4, nextX, topY + 4);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 4. Wildflowers & Sprinkles across the continuous surface
      const flowerColors = ['#FF69B4', '#FBBF24', '#38BDF8', '#FFFFFF', '#C084FC'];
      for (let fx = startX + 24; fx < endX - 24; fx += 32) {
        if (fx < camera.x - 30 || fx > camera.x + camera.viewportWidth + 30) continue;

        const wave = Math.sin(fx * 0.025) * 2.5;
        const fy = topY + wave + 6;
        const fColor = flowerColors[Math.floor(fx / 32) % flowerColors.length];

        ctx.fillStyle = fColor;
        ctx.beginPath();
        ctx.arc(fx - 2, fy, 2, 0, Math.PI * 2);
        ctx.arc(fx + 2, fy, 2, 0, Math.PI * 2);
        ctx.arc(fx, fy - 2, 2, 0, Math.PI * 2);
        ctx.arc(fx, fy + 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  drawFloatingPlatforms(ctx, camera) {
    const barquilloImg = imageLoader.getImage('barquillo') || imageLoader.getImage('plataforma-barquillo');
    const bastonImg = imageLoader.getImage('baston') || imageLoader.getImage('plataforma-baston');

    const floating = this.platforms.filter((p) => p.type !== 'ground');

    for (const plat of floating) {
      // Strict Viewport Culling
      if (!camera.isVisible(plat.x, plat.y, plat.width, plat.height, 80)) continue;

      if (plat.type === 'wafer') {
        // Floating Wafer Platform Sprite ('barquillo.png')
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          const waferGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
          waferGrad.addColorStop(0, '#FEF3C7');
          waferGrad.addColorStop(1, '#D97706');
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fillStyle = waferGrad;
          ctx.fill();
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else if (plat.type === 'candy_cane') {
        // Floating Candy Cane Platform Sprite ('baston.png')
        if (bastonImg && bastonImg.complete && bastonImg.naturalWidth > 0) {
          ctx.drawImage(bastonImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }
}
