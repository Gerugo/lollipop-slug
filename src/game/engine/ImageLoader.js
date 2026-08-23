// Asset Image Preloader for 2D Sprites & Parallax Backgrounds
// Uses Vite's native new URL() resolution for 100% reliable asset loading in dev & GitHub Pages

class ImageLoader {
  constructor() {
    this.images = {};
    this.loaded = false;
    this.total = 0;
    this.count = 0;

    this.sources = {
      player: new URL('../../assets/mascota.png', import.meta.url).href,
      hero: new URL('../../assets/mascota.png', import.meta.url).href,
      mascota: new URL('../../assets/mascota.png', import.meta.url).href,
      mascota_run: new URL('../../assets/mascota_run.png', import.meta.url).href,
      mascota_jump: new URL('../../assets/mascota_jump.png', import.meta.url).href,
      mascota_crouch: new URL('../../assets/mascota_crouch.png', import.meta.url).href,
      mascota_hurt: new URL('../../assets/mascota_hurt.png', import.meta.url).href,
      mascota_victory: new URL('../../assets/mascota_victory.png', import.meta.url).href,
      boss: new URL('../../assets/boss.png', import.meta.url).href,
      boss_walk: new URL('../../assets/boss_walk.png', import.meta.url).href,
      boss_cannon: new URL('../../assets/boss_cannon.png', import.meta.url).href,
      boss_slam: new URL('../../assets/boss_slam.png', import.meta.url).href,
      boss_rage: new URL('../../assets/boss_rage.png', import.meta.url).href,
      boss2: new URL('../../assets/boss2.png', import.meta.url).href,
      boss2_walk: new URL('../../assets/boss2_walk.png', import.meta.url).href,
      boss2_attack: new URL('../../assets/boss2_attack.png', import.meta.url).href,
      boss2_rage: new URL('../../assets/boss2_rage.png', import.meta.url).href,
      gummybear: new URL('../../assets/gummybear.png', import.meta.url).href,
      gummybear_walk: new URL('../../assets/gummybear_walk.png', import.meta.url).href,
      gummybear_shoot: new URL('../../assets/gummybear_shoot.png', import.meta.url).href,
      gummybear_hurt: new URL('../../assets/gummybear_hurt.png', import.meta.url).href,
      pez: new URL('../../assets/pez.png', import.meta.url).href,
      globo: new URL('../../assets/globo.png', import.meta.url).href,
      gato: new URL('../../assets/gato.png', import.meta.url).href,
      manzana: new URL('../../assets/manzana.png', import.meta.url).href,
      platano: new URL('../../assets/platano.png', import.meta.url).href,
      estrella: new URL('../../assets/estrella.png', import.meta.url).href,
      cielo: new URL('../../assets/fondo-cielo.png', import.meta.url).href,
      cielo2: new URL('../../assets/fondo-caverna.jpg', import.meta.url).href,
      colinas: new URL('../../assets/fondo-colinas.png', import.meta.url).href,
      caverna: new URL('../../assets/fondo-cristales.png', import.meta.url).href,
      suelo: new URL('../../assets/suelo-arcilla.png', import.meta.url).href,
      barquillo: new URL('../../assets/barquillo.png', import.meta.url).href,
      baston: new URL('../../assets/baston.png', import.meta.url).href,
      caja: new URL('../../assets/caja.png', import.meta.url).href,
      barricada: new URL('../../assets/barricada.png', import.meta.url).href,
      bidon: new URL('../../assets/bidon.png', import.meta.url).href,
      tanque: new URL('../../assets/tanque.png', import.meta.url).href,
      explosion: new URL('../../assets/explosion.png', import.meta.url).href,
      cielo3: new URL('../../assets/fondo-fabrica.jpg', import.meta.url).href,
      fabrica: new URL('../../assets/fondo-nubes.png', import.meta.url).href,
      roller: new URL('../../assets/roller.png', import.meta.url).href,
      sniper: new URL('../../assets/sniper.png', import.meta.url).href,
      moth: new URL('../../assets/moth.png', import.meta.url).href,
      knight: new URL('../../assets/knight.png', import.meta.url).href,
      boss3: new URL('../../assets/boss3.png', import.meta.url).href,
      cielo4: new URL('../../assets/fondo-regaliz.jpg', import.meta.url).href,
      regaliz: new URL('../../assets/fondo-raices.png', import.meta.url).href,
      latigo: new URL('../../assets/latigo.png', import.meta.url).href,
      acido: new URL('../../assets/acido.png', import.meta.url).href,
      boss4: new URL('../../assets/boss4.png', import.meta.url).href,
      arma_pistol: new URL('../../assets/arma_pistol.png', import.meta.url).href,
      arma_hmg: new URL('../../assets/arma_hmg.png', import.meta.url).href,
      arma_shotgun: new URL('../../assets/arma_shotgun.png', import.meta.url).href,
      arma_rocket: new URL('../../assets/arma_rocket.png', import.meta.url).href,
      arma_latigo: new URL('../../assets/arma_latigo.png', import.meta.url).href,
      arma_grenade: new URL('../../assets/arma_grenade.png', import.meta.url).href,
      cielo5: new URL('../../assets/fondo-pantano.jpg', import.meta.url).href,
      pantano: new URL('../../assets/fondo-canas.png', import.meta.url).href,
      rana: new URL('../../assets/rana.png', import.meta.url).href,
      anguila: new URL('../../assets/anguila.png', import.meta.url).href,
      boss5: new URL('../../assets/boss5.png', import.meta.url).href,
      boss5_bubble: new URL('../../assets/boss5_bubble.png', import.meta.url).href,
      boss5_electric: new URL('../../assets/boss5_electric.png', import.meta.url).href,
      boss5_rage: new URL('../../assets/boss5_rage.png', import.meta.url).href,
      arma_burbujas: new URL('../../assets/arma_burbujas.png', import.meta.url).href,
      cielo6: new URL('../../assets/fondo-cumbres.jpg', import.meta.url).href,
      glaciar: new URL('../../assets/fondo-glaciar.png', import.meta.url).href,
      pinguino: new URL('../../assets/pinguino.png', import.meta.url).href,
      yeti: new URL('../../assets/yeti.png', import.meta.url).href,
      boss6: new URL('../../assets/boss6.png', import.meta.url).href,
      boss6_attack: new URL('../../assets/boss6_attack.png', import.meta.url).href,
      boss6_rage: new URL('../../assets/boss6_rage.png', import.meta.url).href,
      arma_hielo: new URL('../../assets/arma_hielo.png', import.meta.url).href,
      cielo7: new URL('../../assets/fondo-laberinto.jpg', import.meta.url).href,
      gelatina: new URL('../../assets/fondo-gelatina.png', import.meta.url).href,
      murcielago: new URL('../../assets/murcielago.png', import.meta.url).href,
      slime: new URL('../../assets/slime.png', import.meta.url).href,
      boss7: new URL('../../assets/boss7.png', import.meta.url).href,
      boss7_attack: new URL('../../assets/boss7_attack.png', import.meta.url).href,
      boss7_rage: new URL('../../assets/boss7_rage.png', import.meta.url).href,
      arma_laser: new URL('../../assets/arma_laser.png', import.meta.url).href,
      cielo8: new URL('../../assets/fondo-lava.jpg', import.meta.url).href,
      volcan: new URL('../../assets/fondo-volcan.png', import.meta.url).href,
      salamandra: new URL('../../assets/salamandra.png', import.meta.url).href,
      avispa: new URL('../../assets/avispa.png', import.meta.url).href,
      boss8: new URL('../../assets/boss8.png', import.meta.url).href,
      boss8_attack: new URL('../../assets/boss8_attack.png', import.meta.url).href,
      boss8_rage: new URL('../../assets/boss8_rage.png', import.meta.url).href,
      arma_flamethrower: new URL('../../assets/arma_flamethrower.png', import.meta.url).href,
      cielo9: new URL('../../assets/fondo-ciudadela.jpg', import.meta.url).href,
      murallas: new URL('../../assets/fondo-murallas.png', import.meta.url).href,
      gargola: new URL('../../assets/gargola.png', import.meta.url).href,
      guardia_real: new URL('../../assets/guardia_real.png', import.meta.url).href,
      boss9: new URL('../../assets/boss9.png', import.meta.url).href,
      arma_plasma: new URL('../../assets/arma_plasma.png', import.meta.url).href,
      cielo10: new URL('../../assets/fondo-trono.jpg', import.meta.url).href,
      sanctum: new URL('../../assets/fondo-sanctum.png', import.meta.url).href,
      hechicero: new URL('../../assets/hechicero.png', import.meta.url).href,
      boss10: new URL('../../assets/boss10.png', import.meta.url).href,
      arma_cosmic: new URL('../../assets/arma_cosmic.png', import.meta.url).href
    };

    // Immediately start preloading in constructor
    this.preloadAll();
  }

  preloadAll() {
    const keys = Object.keys(this.sources);
    this.total = keys.length;
    this.count = 0;

    if (this.total === 0) {
      this.loaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      keys.forEach((key) => {
        const img = new Image();
        const src = this.sources[key];

        img.onload = () => {
          this.images[key] = img;
          this.count++;
          if (this.count >= this.total) {
            this.loaded = true;
            resolve();
          }
        };

        img.onerror = () => {
          // Fallback to public assets directory
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            this.images[key] = fallbackImg;
            this.count++;
            if (this.count >= this.total) {
              this.loaded = true;
              resolve();
            }
          };
          fallbackImg.onerror = () => {
            this.count++;
            if (this.count >= this.total) {
              this.loaded = true;
              resolve();
            }
          };
          fallbackImg.src = `./assets/${key}.png`;
        };

        img.src = src;

        // If already cached/loaded synchronously
        if (img.complete && img.naturalWidth > 0) {
          this.images[key] = img;
        }
      });
    });
  }

  getImage(key) {
    return this.images[key] || null;
  }

  isReady() {
    return this.loaded;
  }
}

export const imageLoader = new ImageLoader();
export default imageLoader;
