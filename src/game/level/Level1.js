import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Boss } from '../entities/Boss.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Destructible } from '../entities/Destructible.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level1 {
  constructor() {
    this.width = 3600;
    this.height = 540;
    this.bossTriggerX = 2650;

    // Level Platforms (Invisible logical collision boxes)
    this.platforms = [
      // Main Ground Segments (Logical collision)
      { x: 0, y: 460, width: 820, height: 80, type: 'ground', isOneWay: false },
      { x: 880, y: 460, width: 600, height: 80, type: 'ground', isOneWay: false },
      { x: 1540, y: 460, width: 900, height: 80, type: 'ground', isOneWay: false },
      { x: 2480, y: 460, width: 1120, height: 80, type: 'ground', isOneWay: false }, // Boss Arena Ground

      // Elevated Platforms (Alternating between Barquillo and Bastón)
      { x: 220, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 440, y: 280, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 680, y: 350, width: 140, height: 26, type: 'wafer', isOneWay: true },

      { x: 920, y: 370, width: 160, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 1140, y: 290, width: 180, height: 26, type: 'wafer', isOneWay: true },
      { x: 1360, y: 360, width: 150, height: 26, type: 'candy_cane', isOneWay: true },

      { x: 1620, y: 350, width: 200, height: 26, type: 'wafer', isOneWay: true },
      { x: 1880, y: 270, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 2120, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 2340, y: 300, width: 160, height: 26, type: 'candy_cane', isOneWay: true },

      // Boss Arena Platforms
      { x: 2560, y: 350, width: 160, height: 26, type: 'wafer', isOneWay: true },
      { x: 2800, y: 280, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
      { x: 3040, y: 350, width: 160, height: 26, type: 'wafer', isOneWay: true }
    ];
  }

  createEnemies() {
    return [
      // Zone 1: Gummy patrols, pez flying fish, and first turret
      new Enemy({ x: 350, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 460, y: 180, type: 'PEZ' }),
      new Enemy({ x: 500, y: 230, type: 'GUMMY' }),
      new Enemy({ x: 690, y: 300, type: 'TURRET' }),
      new Enemy({ x: 740, y: 410, type: 'GUMMY' }),

      // Zone 2: Balloon bombers & Yellow Gummy Bombers
      new Enemy({ x: 920, y: 120, type: 'GLOBO' }),
      new Enemy({ x: 980, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 1180, y: 240, type: 'GUMMY' }),
      new Enemy({ x: 1300, y: 190, type: 'PEZ' }),
      new Enemy({ x: 1380, y: 410, type: 'GUMMY' }),

      // Zone 3: Outpost with Balloon, Fish and Turrets
      new Enemy({ x: 1650, y: 300, type: 'TURRET' }),
      new Enemy({ x: 1720, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 1820, y: 110, type: 'GLOBO' }),
      new Enemy({ x: 1900, y: 220, type: 'GUMMY' }),
      new Enemy({ x: 2000, y: 190, type: 'PEZ' }),
      new Enemy({ x: 2150, y: 410, type: 'GUMMY' }),
      new Enemy({ x: 2350, y: 250, type: 'GUMMY' }),
      new Enemy({ x: 2420, y: 410, type: 'GUMMY' })
    ];
  }

  createHostages() {
    return [
      new Hostage({ x: 260, y: 310, rewardType: 'HMG' }),
      new Hostage({ x: 620, y: 410, rewardType: 'GRENADE' }),
      new Hostage({ x: 1160, y: 240, rewardType: 'SHOTGUN' }),
      new Hostage({ x: 1880, y: 220, rewardType: 'ROCKET' }),
      new Hostage({ x: 2340, y: 250, rewardType: 'ESTRELLA' })
    ];
  }

  createDestructibles() {
    return [
      new Destructible({ x: 760, y: 396, width: 54, height: 64, hp: 45, dropType: 'HMG' }),
      new Destructible({ x: 1380, y: 396, width: 54, height: 64, hp: 45, dropType: 'GRENADE' }),
      new Destructible({ x: 2180, y: 396, width: 54, height: 64, hp: 45, dropType: 'ESTRELLA' })
    ];
  }

  createVehicle() {
    return new SlugVehicle(1450, 390);
  }

  createBoss() {
    return new Boss(3100, 230);
  }

  // --- 100% REAL PARALLAX BACKGROUND SYSTEM (2 LAYERS) ---
  drawBackground(ctx, camera) {
    const viewX = camera.x;
    const viewW = camera.viewportWidth;
    const viewH = camera.viewportHeight;

    // LAYER 1: SKY WITH 3D SUN (fondo-cielo.jpg, scroll 0.05)
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

    // LAYER 2: CLAY ROLLING HILLS (fondo-colinas.jpg, scroll 0.35)
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

  // --- CONTINUOUS ORGANIC CLAY GROUND RENDERER (NO TILE SEAMS) ---
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

      // Cull if out of camera viewport
      if (endX < camera.x - 60 || startX > camera.x + camera.viewportWidth + 60) {
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
        const wave = Math.sin(fx * 0.025) * 2.5;
        const fy = topY + wave + 6;
        const fColor = flowerColors[Math.floor(fx / 32) % flowerColors.length];

        // Cute flower petals
        ctx.fillStyle = fColor;
        ctx.beginPath();
        ctx.arc(fx - 2, fy, 2, 0, Math.PI * 2);
        ctx.arc(fx + 2, fy, 2, 0, Math.PI * 2);
        ctx.arc(fx, fy - 2, 2, 0, Math.PI * 2);
        ctx.arc(fx, fy + 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Flower Center
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
      if (!camera.isVisible(plat.x, plat.y, plat.width, plat.height)) continue;

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
