import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Boss } from '../entities/Boss.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level1 {
  constructor() {
    this.width = 3600;
    this.height = 540;
    this.bossTriggerX = 2650;

    // Level Platforms (solid ground and elevated wafer/biscuit platforms)
    this.platforms = [
      // Main Ground Segments
      { x: 0, y: 460, width: 800, height: 80, type: 'ground', isOneWay: false },
      { x: 860, y: 460, width: 600, height: 80, type: 'ground', isOneWay: false },
      { x: 1520, y: 460, width: 900, height: 80, type: 'ground', isOneWay: false },
      { x: 2480, y: 460, width: 1120, height: 80, type: 'ground', isOneWay: false }, // Boss Arena Ground

      // Elevated Biscuit & Wafer Platforms (Jump-through)
      { x: 220, y: 360, width: 160, height: 20, type: 'wafer', isOneWay: true },
      { x: 440, y: 280, width: 180, height: 20, type: 'wafer', isOneWay: true },
      { x: 680, y: 350, width: 140, height: 20, type: 'wafer', isOneWay: true },

      { x: 920, y: 370, width: 150, height: 20, type: 'wafer', isOneWay: true },
      { x: 1120, y: 290, width: 180, height: 20, type: 'candy_cane', isOneWay: true },
      { x: 1340, y: 360, width: 140, height: 20, type: 'wafer', isOneWay: true },

      { x: 1600, y: 350, width: 200, height: 20, type: 'wafer', isOneWay: true },
      { x: 1860, y: 270, width: 180, height: 20, type: 'wafer', isOneWay: true },
      { x: 2100, y: 360, width: 160, height: 20, type: 'candy_cane', isOneWay: true },
      { x: 2320, y: 300, width: 160, height: 20, type: 'wafer', isOneWay: true },

      // Boss Arena Platforms
      { x: 2560, y: 350, width: 160, height: 20, type: 'wafer', isOneWay: true },
      { x: 2800, y: 280, width: 180, height: 20, type: 'wafer', isOneWay: true },
      { x: 3040, y: 350, width: 160, height: 20, type: 'wafer', isOneWay: true }
    ];
  }

  createEnemies() {
    return [
      // Zone 1: Gummy patrols, pez flying fish, and first turret
      new Enemy({ x: 350, y: 410, type: 'GUMMY_RED' }),
      new Enemy({ x: 460, y: 180, type: 'PEZ' }),
      new Enemy({ x: 500, y: 230, type: 'GUMMY_RED' }),
      new Enemy({ x: 690, y: 300, type: 'TURRET' }),
      new Enemy({ x: 740, y: 410, type: 'GUMMY_GREEN' }),

      // Zone 2: Balloon bombers & Yellow Gummy Bombers
      new Enemy({ x: 920, y: 120, type: 'GLOBO' }),
      new Enemy({ x: 980, y: 410, type: 'GUMMY_YELLOW' }),
      new Enemy({ x: 1180, y: 240, type: 'GUMMY_RED' }),
      new Enemy({ x: 1300, y: 190, type: 'PEZ' }),
      new Enemy({ x: 1380, y: 410, type: 'GUMMY_GREEN' }),

      // Zone 3: Outpost with Balloon, Fish and Turrets
      new Enemy({ x: 1650, y: 300, type: 'TURRET' }),
      new Enemy({ x: 1720, y: 410, type: 'GUMMY_RED' }),
      new Enemy({ x: 1820, y: 110, type: 'GLOBO' }),
      new Enemy({ x: 1900, y: 220, type: 'GUMMY_YELLOW' }),
      new Enemy({ x: 2000, y: 190, type: 'PEZ' }),
      new Enemy({ x: 2150, y: 410, type: 'GUMMY_GREEN' }),
      new Enemy({ x: 2350, y: 250, type: 'GUMMY_RED' }),
      new Enemy({ x: 2420, y: 410, type: 'GUMMY_YELLOW' })
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

  createBoss() {
    return new Boss(3100, 250);
  }

  // --- 100% REAL PARALLAX BACKGROUND SYSTEM (2 LAYERS) ---
  drawBackground(ctx, camera) {
    const viewX = camera.x;
    const viewW = camera.viewportWidth;
    const viewH = camera.viewportHeight;

    // --- LAYER 1: SKY WITH 3D SUN (fondo-cielo.jpg, scroll 0.05) ---
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

    // --- LAYER 2: CLAY HILLS & FLOWERS (fondo-colinas.jpg, scroll 0.35) ---
    const hillsImg = imageLoader.getImage('colinas');
    if (hillsImg && hillsImg.complete && hillsImg.naturalWidth > 0) {
      const hillsAspect = hillsImg.naturalWidth / hillsImg.naturalHeight;
      const hillsH = viewH * 0.74; // Aligned to bottom 74%
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

  // --- PASTEL GREEN CLAY GROUND & PLATFORMS WITH FLOWERS ---
  drawPlatforms(ctx, camera) {
    for (const plat of this.platforms) {
      if (!camera.isVisible(plat.x, plat.y, plat.width, plat.height)) continue;

      if (plat.type === 'ground') {
        // 1. Pastel Green Clay Ground Base (harmonized with hills)
        const clayGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        clayGrad.addColorStop(0, '#4ADE80'); // Fresh green
        clayGrad.addColorStop(0.25, '#22C55E'); // Rich clay green
        clayGrad.addColorStop(0.7, '#16A34A');
        clayGrad.addColorStop(1, '#14532D'); // Deep soil
        ctx.fillStyle = clayGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // 2. Soft Mint / Lime Top Grass Edge
        const grassTopGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + 14);
        grassTopGrad.addColorStop(0, '#BBF7D0');
        grassTopGrad.addColorStop(0.6, '#86EFAC');
        grassTopGrad.addColorStop(1, '#4ADE80');
        ctx.fillStyle = grassTopGrad;

        // Smooth wavy grass line
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y);
        ctx.lineTo(plat.x + plat.width, plat.y);
        ctx.lineTo(plat.x + plat.width, plat.y + 10);
        for (let ix = plat.width; ix >= 0; ix -= 24) {
          ctx.quadraticCurveTo(plat.x + ix - 12, plat.y + 14, plat.x + ix - 24, plat.y + 10);
        }
        ctx.closePath();
        ctx.fill();

        // 3. Cute Little Colorful Wildflowers on Grass Surface
        const flowerColors = ['#FF69B4', '#FBBF24', '#38BDF8', '#FFFFFF', '#C084FC'];
        for (let s = 0; s < plat.width / 36; s++) {
          const fx = plat.x + s * 36 + 10;
          const fy = plat.y + 5;
          const fColor = flowerColors[s % flowerColors.length];

          // 4 Petals
          ctx.fillStyle = fColor;
          ctx.beginPath();
          ctx.arc(fx - 2.5, fy, 2, 0, Math.PI * 2);
          ctx.arc(fx + 2.5, fy, 2, 0, Math.PI * 2);
          ctx.arc(fx, fy - 2.5, 2, 0, Math.PI * 2);
          ctx.arc(fx, fy + 2.5, 2, 0, Math.PI * 2);
          ctx.fill();

          // Center yellow pistil
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (plat.type === 'wafer') {
        // Golden Biscuit Platform with Pastel Green Frosting
        const waferGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        waferGrad.addColorStop(0, '#FEF3C7');
        waferGrad.addColorStop(0.4, '#FDE68A');
        waferGrad.addColorStop(1, '#D97706');

        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fillStyle = waferGrad;
        ctx.fill();
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Honeycomb grid
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1;
        for (let gx = 12; gx < plat.width; gx += 16) {
          ctx.beginPath();
          ctx.moveTo(plat.x + gx, plat.y);
          ctx.lineTo(plat.x + gx, plat.y + plat.height);
          ctx.stroke();
        }

        // Tiny flowers on platforms
        ctx.fillStyle = '#FF77B0';
        ctx.beginPath();
        ctx.arc(plat.x + 14, plat.y + 4, 2.5, 0, Math.PI * 2);
        ctx.arc(plat.x + plat.width - 14, plat.y + 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (plat.type === 'candy_cane') {
        // Peppermint Candy Cane Bridge
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
        ctx.clip();

        ctx.fillStyle = '#EF4444';
        for (let sx = -plat.height; sx < plat.width + plat.height; sx += 18) {
          ctx.beginPath();
          ctx.moveTo(plat.x + sx, plat.y);
          ctx.lineTo(plat.x + sx + 8, plat.y);
          ctx.lineTo(plat.x + sx - 4, plat.y + plat.height);
          ctx.lineTo(plat.x + sx - 12, plat.y + plat.height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }
}
