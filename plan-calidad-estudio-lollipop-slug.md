# Lollipop Slug — Plan de calidad "estudio AAA" (visual + combate) para los 10 niveles

Trabajo sobre el motor que ya tienes: `Camera.js` (ya soporta `shake()` y `zoom`), `ParticleSystem.js` (ya tiene `emitSparkles`, `emitShockwave`, `emitCandyShards`, `emitSyrupSplash`, `emitConfetti`, etc.), `SoundManager.js` (SFX sintetizados por Web Audio) e `ImageLoader.js` con sprites PNG reales por entidad. Esa base es buena — lo que falta para que "se sienta de estudio" no es rehacer el motor, es un **toolkit de "juice" transversal** que hoy no existe (no hay hit-stop, ni números de daño, ni flash de impacto) y una **pasada de dirección de arte** consistente entre los 10 niveles.

No tengo el código actualizado de los niveles 4-10 en este chat — este plan está construido sobre la arquitectura compartida por todos los niveles (que sí conozco), así que aplica igual a los 10. Si me subes el .zip actual puedo darte notas puntuales por nivel además de esto.

---

## Parte 1 — El toolkit que falta (constrúyelo una vez, se usa en los 10 niveles)

Esto es lo más rentable: son ~6 sistemas pequeños y transversales que, en cuanto existen, se enchufan a cada enemigo/jefe/nivel sin rediseñar nada.

### 1. Hit-stop (freeze frame de impacto)
No existe todavía (`GameEngine.js` no tiene `timeScale`). Es el efecto #1 que separa un juego "indie con partículas" de uno que "pega fuerte": al conectar un golpe, congelas el juego 40-90ms antes de aplicar el daño.
```js
// En GameEngine: un timeScale global que multiplica dt antes de update()
this.timeScale = 1.0;
this.hitStopTimer = 0;
triggerHitStop(duration = 0.05, scale = 0.05) {
  this.hitStopTimer = duration;
  this.timeScale = scale;
}
// en el loop principal: const dt = rawDt * this.timeScale;
```
Escala sugerida: golpe normal 40ms, golpe crítico/arma pesada 80ms, impacto de jefe en fase nueva 150ms.

### 2. Flash de impacto (hit-flash) con contorno
Tus enemigos ya tienen `hurtTimer` — actualmente probablemente solo cambia opacidad/color. Súbelo a nivel "estudio" dibujando el sprite dos veces: una silueta blanca sólida (usando `globalCompositeOperation = 'source-atop'` sobre un rect blanco) desplazada 1-2px, más el sprite normal encima con opacidad decreciente en 3-4 frames. Es la técnica estándar de Platinum/Vlambeer que da esa sensación de "impacto sólido".

### 3. Números de daño flotantes + combo counter
No están implementados. Un pool simple de texto (usa el mismo patrón de objeto que tu `ParticleSystem`, no una clase nueva): número que sale con un pequeño arco, escala 1.3x→1.0x en 100ms, color por tipo de arma (blanco=normal, amarillo=crítico, morado=veneno/ácido si usas el nivel 4). Añade un contador de combo (enemigos golpeados sin recibir daño) en la esquina del HUD — barato de hacer, altísimo impacto percibido.

### 4. Screen shake con curva, no solo intensidad
Ya tienes `camera.shake(intensity, duration)`. Súbelo de nivel separando **shake direccional** (explosiones = shake radial desde el punto de impacto, no solo ruido random en X/Y) y usando una curva de decaimiento (ease-out) en vez de decaimiento lineal — se nota mucho más "con peso" y menos "temblor de cámara rota".

### 5. Camera punch-in en momentos clave
`Camera.js` ya tiene `zoom`/`targetZoom`. Úsalo activamente: punch-in de 1.0→1.08 en 150ms al golpear a un jefe con arma pesada (ROCKET/GRENADE), y un zoom-out dramático + slow-mo (timeScale a 0.3 por 0.6s) en la transición de fase de cada jefe (ya tienes el concepto de `phase` en `Boss.js`/`Boss3.js` — solo falta engancharlo a cámara+sonido).

### 6. Telegraphs más legibles (accesibilidad + "feel" de estudio)
Ya usas telegraph en `ROLLER`/`SNIPER` (charge/laser sight). Estandarízalo como regla de diseño para **todo** ataque nuevo de niveles 4-10: 0.3-0.5s de aviso visual (destello del color del daño que va a hacer: rojo=físico, verde=ácido, azul=hielo) + un sonido de "anticipación" distinto del de disparo. Esto no es solo estética — es lo que hace que el combate se sienta "justo" y pulido en vez de errático, sobre todo siendo un juego para niños.

---

## Parte 2 — Dirección de arte transversal (para que los 10 niveles se vean "de la misma casa")

Ahora mismo cada nivel define su propio `skyGradient`/`groundGradient` en el config — bien para variedad, pero sin una regla común puede sentirse inconsistente. Propongo una **biblia de arte corta**:

- **Temperatura de color como narrativa**: niveles 1-3 (mundo dulce) usan paletas cálidas/pastel de alta saturación. A partir del nivel 4 (corrupción del Rey Amargo), introduce progresivamente un 10-15% de desaturación y un tinte hacia verdes/morados apagados en las sombras — no cambia el estilo, pero el jugador *siente* que algo va mal antes de que se lo digas. En el nivel 10, la arena empieza con esa paleta apagada y **recupera saturación** a medida que baja el HP del Rey Amargo (refuerza mecánicamente tu arco de redención).
- **Contraluz y profundidad**: añade una capa de "rim light" sutil (borde de 1-2px más claro en el lado opuesto a la luz) a los sprites de enemigos y al jugador. Con canvas 2D esto se logra dibujando el sprite offset con `globalCompositeOperation='lighter'` y máscara — barato, y es lo que más "vende" que un sprite 2D no es plano.
- **Parallax de 4 capas mínimo** (hoy pareces tener 2-3: cielo + colinas/fondo + suelo). Añade una capa extra muy desenfocada (blur vía `filter: blur()` de canvas si el rendimiento lo permite, o simplemente muy oscura/baja opacidad) detrás de todo, y una capa de partículas ambientales *delante* del jugador ocasionalmente (nieve, chispas, confeti) — el "delante" es el truco que más falta en juegos indie y más se nota en juegos de estudio.
- **⚠️ Paridad de fondos parallax en los niveles 4-10 (obligatorio, no opcional)**: los niveles 1-3 usan fondos parallax reales por bioma (`cielo`/`cielo2`/`cielo3`, `colinas`, `caverna`, `fabrica` en tu `ImageLoader.js`, cada uno con su propio degradado y textura). Si al implementar los niveles 4-10 se usó solo `skyGradient`/`groundGradient` planos sin una imagen de fondo por capa, el salto de calidad visual entre "los niveles viejos" y "los nuevos" se va a notar muchísimo — es la inconsistencia más visible que puede tener el juego, más que cualquier efecto de combate. Antes de la pasada de rim light o telegraphs, revisa esto primero:
  - Cada bioma nuevo (regaliz, pantano de gaseosa, montañas heladas, ciudadela de nubes, fundición, castillo, trono) necesita su propia imagen de fondo lejano (tipo `fondo-cielo.jpg`) + una capa intermedia tipo `colinas`/`caverna` con su propio parallax speed, igual que ya hacen los niveles 1-3 — no basta con reciclar un gradiente CSS/canvas.
  - Usa exactamente el mismo patrón que ya tienes en `ImageLoader.js` (añadir claves nuevas tipo `cielo4`, `fondo5`, etc. con `new URL(...)`) para que el pipeline de carga sea idéntico y no haya que tocar `GameEngine`/`Camera` para renderizarlas.
  - Mantén la misma velocidad relativa de parallax por capa que usan los niveles 1-3 (el fondo lejano se mueve más lento que la capa intermedia, que a su vez se mueve más lento que el suelo) — si los niveles nuevos usan velocidades distintas, se va a sentir "raro" al pasar de un nivel viejo a uno nuevo aunque cada uno se vea bien por separado.
- **Vida en el fondo**: cada bioma debería tener 1-2 elementos de fondo animados de bajo costo (una bandera ondeando, vapor subiendo, una cinta transportadora de fondo moviéndose) — no interactúan con el jugador, solo dan sensación de mundo vivo.
- **Sprite sheets con más frames de transición**: si hoy la animación es mayormente procedural (rotación/wobble por código, que vi en `Boss.js`), está bien para peso físico, pero para que "se vea de estudio" los enemigos nuevos (4-10) deberían tener al menos: idle (2-3 frames), run/move, telegraph (1 frame distintivo), hit-reaction (1 frame), death/pop (2-3 frames). No hace falta animación completa de 12 frames por estado — el salto de calidad grande es tener *un* frame de telegraph y *un* frame de hit-reaction distintos del idle.

---

## Parte 3 — HUD y transiciones (lo que se ve todo el rato, así que rinde mucho pulirlo)

- **Barra de vida de jefe segmentada por fase**: en vez de una barra continua, márcala con separadores en los umbrales de fase (70%/35% en `Boss.js`, 65%/30% en `Boss3.js`) para que el jugador vea venir el cambio de fase — refuerzo visual barato y muy "de estudio de peleas".
- **Título de nivel tipo cinemática**: al entrar a cada nivel, texto grande con el nombre (ya los tienes: "La Fábrica de los Sueños Rotos", etc.) que entra con un slide + fade y se queda 1.5s, con una línea de subtítulo corta de la historia. Reutiliza tus modales existentes (`LevelCompleteModal` como plantilla).
- **Transición entre niveles**: un iris/wipe con el color dominante del bioma que estás dejando, no solo un corte — 300-400ms, muy barato de implementar con un rect de canvas animado.
- **Iconos de arma con estado**: glow sutil en el arma activa del HUD, y un micro "punch" de escala cuando cambias de arma o recoges una nueva.
- **Vibración táctil en móvil**: dado que tienes `TouchGamepad.jsx`, la Vibration API (`navigator.vibrate(ms)`) en impactos grandes/recibir daño es gratis y se siente muy "producto pulido" en móvil.

---

## Parte 4 — Aplicación nivel por nivel (usando el toolkit de la Parte 1)

No repito mecánicas de nivel (ya están en el plan anterior) — esto es la capa de "feel" específica que le da personalidad de combate a cada uno:

| Nivel | Firma de combate específica |
|---|---|
| 1-2 | Baseline: hit-stop corto, shake ligero — es el tutorial de sensaciones, no debe abrumar |
| 3 | Reina de Azúcar: primer jefe con punch-in de cámara en cambio de fase; aquí "estrenas" el toolkit completo |
| 4 | Golpes con ÁCIDO dejan el hit-flash en verde en vez de blanco — refuerza lectura de daño por tipo |
| 5 | La marea que sube/baja debería tener su propio shake ambiental sutil y constante (no de combate) para dar tensión |
| 6 | Los golpes en superficie de hielo deberían tener partículas de `emitCrumble` ya existente + un shake con "deslizamiento" (offset X que decae distinto a Y) |
| 7 | Aquí el punch-in de cámara se combina con las corrientes de viento — usa el zoom para vender el vórtice del jefe |
| 8 | Suelo electrificado: parpadeo de luz ambiental sincronizado (no solo el suelo, también tintar levemente toda la escena) al activarse |
| 9 | Es el gauntlet — sube ligeramente la duración del hit-stop global (+10-15%) para que el jugador sienta cada golpe como "más pesado" ya que hay más enemigos élite |
| 10 | Todo el toolkit al máximo: slow-mo real (no solo hit-stop de 80ms) en transición de fase, paleta que recupera saturación, número de daño especial dorado en el golpe final |

---

## Parte 5 — Orden de trabajo recomendado (para Antigravity/Gemini)

1. **Toolkit primero, contenido después.** Implementa hit-stop, hit-flash con contorno, números de daño y curva de shake como sistemas genéricos en el motor (`GameEngine.js`/`ParticleSystem.js`). Sin esto, cualquier pasada de arte nivel por nivel se pierde porque el combate seguirá sintiéndose plano.
2. Aplica el toolkit al **nivel 1** como piloto — es el más jugado/probado, así ves el efecto en un nivel que ya conoces bien antes de tocar los otros 9.
3. Pasada de dirección de arte (temperatura de color progresiva, parallax de 4 capas, rim light) — puede ir en paralelo al paso 2 porque toca archivos distintos (configs de bioma vs. lógica de combate).
4. HUD y transiciones (Parte 3) — independiente, se puede hacer en cualquier momento.
5. Firma de combate específica por nivel (tabla de la Parte 4) — al final, nivel por nivel, una vez el toolkit esté estable.

---

### Una idea extra
Considera grabar 2-3 GIFs cortos del "antes/después" del hit-stop + hit-flash en el nivel 1 y enseñárselos a quien sea que juegue el juego (aunque sea a ti mismo unos días después) — es la manera más rápida de validar si el "punch" del combate mejoró, porque este tipo de cambios son muy difíciles de juzgar mientras programas y muy obvios en cuanto los ves de fuera.
