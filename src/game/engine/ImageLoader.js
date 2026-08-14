// Asset Image Preloader for 2D Sprites & Parallax Backgrounds
// Uses Vite's native new URL() resolution for 100% reliable asset loading in dev & GitHub Pages

class ImageLoader {
  constructor() {
    this.images = {};
    this.loaded = false;
    this.total = 0;
    this.count = 0;

    // Vite-resolved reliable asset URLs
    this.sources = {
      player: new URL('../../assets/mascota.png', import.meta.url).href,
      hero: new URL('../../assets/mascota.png', import.meta.url).href,
      boss: new URL('../../assets/boss.png', import.meta.url).href,
      gummybear: new URL('../../assets/gummybear.png', import.meta.url).href,
      pez: new URL('../../assets/pez.png', import.meta.url).href,
      globo: new URL('../../assets/globo.png', import.meta.url).href,
      gato: new URL('../../assets/gato.png', import.meta.url).href,
      manzana: new URL('../../assets/manzana.png', import.meta.url).href,
      platano: new URL('../../assets/platano.png', import.meta.url).href,
      estrella: new URL('../../assets/estrella.png', import.meta.url).href,
      cielo: new URL('../../assets/fondo-cielo.jpg', import.meta.url).href,
      colinas: new URL('../../assets/fondo-colinas.jpg', import.meta.url).href,
      suelo: new URL('../../assets/suelo-arcilla.png', import.meta.url).href,
      barquillo: new URL('../../assets/barquillo.png', import.meta.url).href,
      baston: new URL('../../assets/baston.png', import.meta.url).href,
      caja: new URL('../../assets/caja.png', import.meta.url).href,
      obstaculo: new URL('../../assets/obstaculo.png', import.meta.url).href,
      barricada: new URL('../../assets/barricada.png', import.meta.url).href,
      tanque: new URL('../../assets/tanque.png', import.meta.url).href,
      explosion: new URL('../../assets/explosion.png', import.meta.url).href
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
