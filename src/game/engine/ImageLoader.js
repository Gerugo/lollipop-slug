// Asset Image Preloader for 2D Sprite & Parallax Backgrounds

class ImageLoader {
  constructor() {
    this.images = {};
    this.loaded = false;
    this.total = 0;
    this.count = 0;

    this.sources = {
      player: './mascota.png',
      boss: './boss.png',
      gummybear: './gummybear.png',
      pez: './pez.png',
      globo: './globo.png',
      gato: './gato.png',
      manzana: './manzana.png',
      platano: './platano.png',
      estrella: './estrella.png',
      cielo: './fondo-cielo.jpg',
      colinas: './fondo-colinas.jpg'
    };
  }

  preloadAll() {
    return new Promise((resolve) => {
      const keys = Object.keys(this.sources);
      this.total = keys.length;
      this.count = 0;

      if (this.total === 0) {
        this.loaded = true;
        resolve();
        return;
      }

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
          console.warn(`[ImageLoader] Warning: Failed to load ${src}, trying fallback path...`);
          const fallbackImg = new Image();
          let fallbackSrc = `./assets/${key}.png`;
          if (key === 'cielo') fallbackSrc = './assets/fondo-cielo.jpg';
          if (key === 'colinas') fallbackSrc = './assets/fondo-colinas.jpg';

          fallbackImg.onload = () => {
            this.images[key] = fallbackImg;
            this.count++;
            if (this.count >= this.total) {
              this.loaded = true;
              resolve();
            }
          };

          fallbackImg.onerror = () => {
            if (key === 'colinas') {
              const thirdImg = new Image();
              thirdImg.onload = () => {
                this.images[key] = thirdImg;
                this.count++;
                if (this.count >= this.total) {
                  this.loaded = true;
                  resolve();
                }
              };
              thirdImg.onerror = () => {
                console.error(`[ImageLoader] Failed to load asset key: ${key}`);
                this.count++;
                if (this.count >= this.total) {
                  this.loaded = true;
                  resolve();
                }
              };
              thirdImg.src = './fondo-colinas.png';
              return;
            }

            console.error(`[ImageLoader] Failed to load asset key: ${key}`);
            this.count++;
            if (this.count >= this.total) {
              this.loaded = true;
              resolve();
            }
          };

          fallbackImg.src = fallbackSrc;
        };

        img.src = src;
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
