# 🍭 LOLLIPOP SLUG (Mundo Lulipop Hero) 🎮
> *Un videojuego arcade "Run and Gun" estilo clásico Metal Slug en un vibrante mundo dulce y kawaii.*

![Lollipop Slug Banner](./public/hero.png)

---

## 🌟 Características Principales

1. **Estética y Personaje (Lulipop Hero)**:
   - Protagonista humanoide de piruleta 3D kawaii con cabeza espiral pastel multicolor (rosa chicle, amarillo limón, verde menta, azul cielo y lavanda), ojos negros brillantes, mejillas sonrosadas y cuerpo marshmallow tie-dye con palo de madera.
   - **Renderizado Procedural 2D**: Replicación visual "suave 3D" en Canvas 2D utilizando degradados radiales y lineales (`createRadialGradient`, `createLinearGradient`), sombras suaves, brillos especulares y animaciones fluidas a 60 FPS estables.
   - **HUD Arcade**: Iconos de vida personalizados con la figura de piruleta del protagonista y contador de salud estilo retro.

2. **Mecánicas de Juego (Core Loop Metal Slug)**:
   - **Movimiento Completo**: Desplazamiento lateral con inercia, salto parabólico, agacharse para esquivar proyectiles y descenso a través de plataformas (`Abajo + Salto`).
   - **Disparos Multidireccionales**: Horizontal (izquierda/derecha), vertical hacia arriba y disparos diagonales en el aire.
   - **Sistema de Vidas y Daño**: 3 Vidas iniciales con 3 puntos de salud cada una, retroceso de impacto y 1.5s de invulnerabilidad parpadeante (i-frames).
   - **Arsenal de Armas y Drops**:
     * 🍬 **Pistola de Chicles**: Arma básica infinita con salpicadura elástica.
     * ☁️ **Heavy Marshmallow Gun (H.M.G.)**: Ráfaga ultra-rápida de nubes de azúcar comprimidas (200 balas) con locución *"Heavy Marshmallow Gun!"*.
     * 💥 **Shot-Gum**: Escopeta de dispersión con 6 fragmentos de caramelo macizo.
     * 🚀 **Rocket Popsicle**: Misiles helados con estela de escarcha y gran explosión en área de sirope de fresa.
     * 💣 **Granadas de Soda / Mentos**: Arrojo parabólico con efervescencia y erupción masiva de refresco carbonatado.
   - **Rehenes Dulces (Candy Hostages)**:
     * Muñequitos de jengibre amarrados con regaliz que al liberarse hacen reverencia, exclaman *"THANK YOU!"* y entregan cajas de armas o bonus de puntuación (+10,000 PTS).
   - **Enemigos & Boss Final**:
     * Soldados ositos de gominola (rojos, verdes saltadores y amarillos bombarderos).
     * Torretas de máquinas de chicles con cañones de mandíbula rebotadores.
     * Drones flotantes de algodón de azúcar con hélices.
     * **Jefe Final: "The Gumball Mech"**: Robot gigante con cúpula de cristal y chicles animados, 3 fases evolutivas con ataques en ráfaga, misiles gemelos, láser de fresa y modo enfurecido (<35% HP) con barra de vida superior.

3. **Controles & Soporte Móvil Responsivo (Landscape)**:
   - Detección de orientación con overlay: *"Gira tu dispositivo a horizontal 🔄"* cuando se usa en vertical.
   - Relación de aspecto 16:9 con contenedor `object-contain`.
   - **Controles de Escritorio**:
     * `A` / `D` o `Flechas`: Moverse a izquierda / derecha.
     * `W` / `Flecha Arriba`: Apuntar hacia arriba.
     * `S` / `Flecha Abajo`: Agacharse (esquiva disparos enemigos).
     * `Espacio` / `W`: Saltar.
     * `J` / `Z` / `Click Izquierdo`: Disparar arma.
     * `K` / `X` / `Click Derecho`: Lanzar Granada de Soda.
     * `Esc` / `P`: Pausar partida.
   - **Gamepad Virtual Táctil**:
     * D-Pad / Joystick virtual ergonómico en la izquierda.
     * Botones táctiles grandes en la derecha: `[FUEGO]`, `[SALTO]`, `[BOMBA]`.
     * `touch-action: none` y `user-select: none` para evitar zooms o desplazamientos accidentales.

4. **Sintetizador Web Audio API NATIVO**:
   - Efectos sonoros procedurales sintetizados en tiempo real: disparos pop, ráfagas, escopetazos, estallidos de soda, fanfarrias y voz de rehén.
   - Banda sonora chiptune/synthwave dinámica con transiciones automáticas para el nivel y la batalla contra el Boss.

---

## 🚀 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/lollipop-slug.git

# 2. Entrar en la carpeta del proyecto
cd lollipop-slug

# 3. Instalar las dependencias
npm install

# 4. Iniciar el servidor de desarrollo
npm run dev

# 5. Compilar para producción
npm run build
```

---

## 🛠️ Tecnologías Utilizadas

- **React 18 / 19** - Gestión de estados, menús y modales interactivos.
- **Vite** - Empaquetador ultra rápido con configuración de rutas relativas (`base: './'`).
- **Tailwind CSS** - Sistema de diseño y utilidades con paleta de colores candy.
- **HTML5 Canvas 2D** - Motor de renderizado procedural a 60 FPS con delta time.
- **Web Audio API** - Generación y síntesis de audio procedural en tiempo real.
- **GitHub Actions** - Despliegue automático a GitHub Pages.

---

## 📄 Licencia

Desarrollado con ❤️ y mucho azúcar para los amantes de los clásicos arcade. MIT License.
