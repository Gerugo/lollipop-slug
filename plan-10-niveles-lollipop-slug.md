# Lollipop Slug — Plan de expansión a 10 niveles

Analicé tu código (`GameEngine.js`, `Level1/2/3Config.js`, `Enemy.js`, `Boss.js`, `Boss3.js`, `Weapons.js`, `Hostage.js`, `Destructible.js`, `SlugVehicle.js`) para que el plan encaje con lo que ya tienes construido, no con una idea genérica.

## Lo que ya existe (resumen técnico)
- **Niveles 1-3**, mundos de 6400-7800px, 3-4 biomas por nivel con degradados de cielo/suelo propios.
- **Enemigos**: `GUMMY` (soldado base), `PEZ`, `GLOBO/DRONE`, `TURRET` (niveles 1-2) → `ROLLER`, `SNIPER`, `MOTH`, `KNIGHT` (nivel 3, más avanzados).
- **Jefes**: `Boss.js` = "Gumball Mech Titan" (reutilizado en nivel 1 con 600 HP y nivel 2 con 800 HP escalado). `Boss3.js` = "Sugar Queen Empress" (900 HP, único, flota, 3 fases).
- **Rehenes** (gatitos) que sueltan armas: ROCKET, SHOTGUN, HMG, GRENADE, ESTRELLA.
- **Destructibles** que sueltan armas, **vehículo** (`SlugVehicle`), plataformas especiales (`wafer`, `candy_cane`, `moving`, `sinking`, `bounce`).
- Nivel 2 escala enemigos con `hp * 1.25` — ya tienes el patrón de escalado que usaremos.

## ⚠️ Antes de los niveles: un cambio de arquitectura que te va a ahorrar dolores
Ahora mismo `GameEngine.js` elige el nivel con una cadena de `if/else` (`new Level1()`, `new Level2()`, `new Level3()`...). Con 10 niveles eso se vuelve frágil y repetitivo. Te recomiendo pedirle a Gemini que primero refactorice a un **registro de niveles data-driven**:

```js
export const LEVEL_REGISTRY = [
  { id: 1, LevelClass: Level1, name: 'Del Bosque a la Fábrica' },
  { id: 2, LevelClass: Level2, name: 'Las Profundidades de Chocolate' },
  // ... hasta el 10
];
```
Y que `GameEngine` haga `new LEVEL_REGISTRY[index].LevelClass()` en vez de la cadena de condicionales. Esto es un prerrequisito de una sola vez, no un nivel — pero hará que añadir el 4 al 10 sea copiar-pegar en vez de tocar lógica central.

---

## Hilo narrativo (por qué encajan los 10 niveles)

Ahora mismo la Reina de Azúcar (nivel 3) es el único jefe "propio" — el resto reutiliza al Gumball Mech Titan. Para dar coherencia, propongo este giro:

> La Reina de Azúcar **no es la villana real**: fue corrompida por una grieta de "Amargura" que se está filtrando desde las profundidades del Reino Lulipop. El Gumball Mech Titan que peleaste dos veces era en realidad **su guardián construido con esa misma corrupción** — por eso reaparece más fuerte. Al derrotarla (final del nivel 3), en vez de "morir", la Reina se libera del hechizo y te revela que la verdadera fuente es **El Rey Amargo**, escondido bajo el reino. Los niveles 4-10 son el descenso/ascenso hacia él, cada uno una zona corrompida distinta, y cada jefe es un teniente suyo — hasta el enfrentamiento final.

Esto mantiene el tono no-violento que ya tienes (los enemigos "hacen pop", no mueren) y añade un arco de redención apto para niños: **al vencer a un jefe, no lo destruyes, lo liberas** de la corrupción amarga y vuelve a su forma dulce original. Puedes reutilizar tu sistema de `Modal` (como `LevelCompleteModal`) para 2-3 viñetas de diálogo cortas al empezar/terminar cada nivel — no hace falta un sistema de cutscenes pesado.

---

## Curva de dificultad — vista general

| # | Nivel | Ancho aprox. | Mecánica nueva | Enemigos nuevos | Jefe | HP jefe |
|---|---|---|---|---|---|---|
| 1 | Del Bosque a la Fábrica | 6400 | — | GUMMY, PEZ, GLOBO, TURRET | Gumball Mech Titan | 600 |
| 2 | Profundidades de Chocolate | 7200 | — | (reusa 1) | Gumball Mech Titan (var.) | 800 |
| 3 | Fábrica de los Sueños Rotos | 7800 | — | ROLLER, SNIPER, MOTH, KNIGHT | Sugar Queen Empress | 900 |
| 4 | Bosque de Regaliz Amargo | 6800 | terreno pegajoso + charcos ácidos persistentes | LATIGO, ÁCIDO | Víbora de Regaliz | 1100 |
| 5 | Pantano de Gaseosa | 7200 | marea líquida que sube/baja (plataformeo a contrarreloj) | RANA, ANGUILA | Medusa Efervescente | 1300 |
| 6 | Montañas de Chicle Congelado | 7400 | físicas de hielo (deslizamiento) + plataformas que se rompen | YETI_MENOR, COPO | Yeti Glacial | 1500 |
| 7 | Ciudadela de Nubes de Merengue | 6600 (vertical) | corrientes de viento + doble salto desbloqueable | CENTINELA, VENDAVAL | Comandante Nube (heraldo) | 1700 |
| 8 | Fundición Subterránea Amarga | 8000 | cintas transportadoras + suelo electrificado a intervalos | ROBOT_AMARGO | El Maestro Amargo | 2000 |
| 9 | Castillo de Sal y Vinagre | 8400 | gauntlet: remezcla todas las mecánicas anteriores + élites | versiones ÉLITE de todo lo anterior + GUARDIA_REAL | Sal & Vinagre (dobles) | 1100 c/u |
| 10 | Trono Amargo | 5000 (arena que cambia) | arena dinámica que se transforma por fase | oleadas de corte, sin enemigos nuevos | El Rey Amargo | ~3000 (4 fases) |

La progresión de HP de jefe (600→800→900→1100→1300→1500→1700→2000→2200→~3000) sigue de cerca la curva +150/+200 que ya insinúa tu escalado del nivel 2, así que se siente continuo y no un salto brusco.

---

## Nivel 4 — "El Bosque de Regaliz Amargo"
**Historia**: primera grieta de amargura, justo al salir del trono de la Reina. El bosque dulce se está volviendo correoso y pegajoso.

**Biomas**: A) Raíces de Regaliz (terreno pegajoso ralentiza) · B) Charcas de Jarabe Ácido (charcos dañan si te quedas parado) · C) Guarida de la Víbora (arena del jefe).

**Mecánica nueva**: plataforma tipo `sticky` (reduce velocidad horizontal mientras la pisas) y hazard `acid_pool` (daño por segundo, ya no solo un enemigo — es terreno). Introduce también una plataforma `elastic` que se estira y lanza al saltar sobre ella (variante de tu `bounce` actual pero con recorrido, no solo impulso vertical).

**Enemigos nuevos**:
- `LATIGO`: melee de alcance largo, telegrafía el golpe (como tu `ROLLER`) antes de un latigazo en arco.
- `ACIDO`: enemigo tipo `PEZ` que en vez de disparar deja charcos de ácido al morir/al atacar — combina enemigo + hazard.

**Arma nueva (rehén)**: `LATIGO_DULCE` — arma cuerpo a cuerpo de arco amplio, buena contra grupos.

**Jefe**: **Víbora de Regaliz, la Tejedora** (1100 HP) — cuerpo multi-segmento (reutiliza la lógica de sprite por partes que ya tienes en `Boss3`), Fase 1 constriñe y golpea con la cola, Fase 2 escupe charcos ácidos en el suelo de la arena, Fase 3 se entierra y emerge por sorpresa cerca del jugador (telegrafiado con temblor de cámara, que ya usas en `Boss.js`).

---

## Nivel 5 — "El Pantano de Gaseosa"
**Historia**: la amargura se disuelve en el río que baja del bosque, volviéndolo un pantano carbonatado y corrosivo.

**Biomas**: A) Aguas Poco Profundas · B) Corriente de Burbujas Ácidas · C) Laguna Eléctrica (arena).

**Mecánica nueva**: **marea que sube y baja** en ciclos de tiempo — secciones enteras del suelo se inundan y hay que subir a plataformas antes de que suba el nivel (peligro por tiempo, no solo por caída). Burbujas `bounce` mejoradas que lanzan en diagonal según donde caes.

**Enemigos nuevos**:
- `RANA`: salta en arcos predecibles, dispara una burbuja a distancia al aterrizar.
- `ANGUILA`: se esconde bajo el agua/jarabe, emerge para dar una descarga si te acercas — enseña al jugador a leer el entorno antes de avanzar.

**Arma nueva**: `CANON_BURBUJAS` — proyectil que rebota en superficies, bueno para esquinas y enemigos escondidos.

**Jefe**: **Medusa Efervescente** (1300 HP) — flota sobre la marea (como `Boss3`, `gravity: 0`), Fase 1 barrido de tentáculos eléctricos, Fase 2 invoca 2-3 `ANGUILA` como refuerzo, Fase 3 "tormenta de burbujas" que cubre la arena y obliga a esquivar mientras la marea sube al mismo tiempo — combina el hazard del nivel con el jefe.

---

## Nivel 6 — "Las Montañas de Chicle Congelado"
**Historia**: el frío es lo único que frena la amargura, pero también congeló el chicle del reino volviéndolo quebradizo.

**Biomas**: A) Laderas Heladas · B) Grietas de Chicle · C) Pico de la Corona (arena).

**Mecánica nueva**: plataformas `ice` con fricción reducida (el jugador resbala al parar/girar) y plataformas `crumbling` que se rompen 1-1.5s después de pisarlas (tensión de tiempo). Sección opcional de "avalancha" con scroll automático hacia el final del bioma B (secuencia de persecución, alto impacto visual y barato de implementar reusando tu cámara).

**Enemigos nuevos**:
- `YETI_MENOR`: lento, mucha vida, embiste en línea recta con knockback fuerte — enseña a esquivar en vez de tanquear.
- `COPO`: dron volador con patrón errático (a diferencia de tu `GLOBO`, que es más predecible) que deja caer carámbanos que dañan el suelo.

**Arma nueva**: `ALIENTO_HELADO` — congela enemigos normales por 2-3s (control de crowd, muy satisfactorio con niños).

**Jefe**: **Yeti Glacial, Rey del Chicle Congelado** (1500 HP) — pisotón con onda de choque (rompe las plataformas `crumbling` de la arena), soplido helado en cono, Fase 3 carga a través de toda la pantalla dejando un rastro de hielo que se resquebraja tras él.

---

## Nivel 7 — "La Ciudadela de Nubes de Merengue"
**Historia**: primera vez que aparece un heraldo directo del Rey Amargo — la corrupción ya tiene un nombre y una cara.

**Biomas**: A) Islas Flotantes · B) Corrientes de Viento · C) Torre del Heraldo (arena, vertical).

**Mecánica nueva**: **corrientes de viento** (zonas que empujan al jugador horizontal o verticalmente sin dañar, afectan el salto) y desbloqueo permanente de **doble salto** vía un power-up de un rehén especial ("Alas de Merengue") — primer upgrade de movimiento del juego, se siente como un premio real de mitad de campaña.

**Enemigos nuevos**:
- `CENTINELA`: volador que dispara proyectiles teledirigidos suaves (obliga a moverse, no solo a esquivar en el sitio).
- `VENDAVAL`: no ataca directo, genera una zona de viento que te empuja hacia pinchos/vacíos — enemigo "de posicionamiento".

**Arma nueva**: `RAYO_ARCOIRIS` — láser perforante, atraviesa varios enemigos en línea (buen respiro después de tanto enemigo volador disperso).

**Jefe**: **Comandante Nube, Heraldo del Amargor** (1700 HP) — primer jefe que **habla** de El Rey Amargo (aquí revelas la trama). Nave/armadura voladora, oleadas de misiles teledirigidos, vórtice de viento que arrastra al jugador al centro, Fase 3 se retira al fondo y ataca en paralaje mientras manda drones — buen uso de tu sistema de cámara/paralaje ya existente.

---

## Nivel 8 — "La Fundición Subterránea Amarga"
**Historia**: bajo la ciudadela, la fábrica donde se produce la amargura a escala industrial. Primer teniente "de verdad" del Rey.

**Biomas**: A) Cintas de Producción · B) Sala de Calderas · C) Núcleo de la Fundición (arena).

**Mecánica nueva**: **cintas transportadoras** (mueven al jugador y a los enemigos, hay que contrarrestar con el movimiento) y **suelo electrificado por intervalos** (parpadea seguro/peligroso en un patrón, plataformeo de ritmo). Aquí es donde el juego se pone técnicamente más exigente.

**Enemigos nuevos**:
- `ROBOT_AMARGO`: versión blindada del `GUMMY`, con un escudo frontal como el `KNIGHT` pero que además dispara — obliga a flanquear.

**Sin arma nueva** en este nivel a propósito — es el punto donde el jugador debe dominar todo su arsenal acumulado, no aprender otro más.

**Jefe**: **El Maestro Amargo** (2000 HP) — mech de varias partes (brazo cañón, generador de escudo, piernas), cada parte es un punto débil independiente (como sugiere tu estructura de fases en `Boss.js`), y la arena tiene las cintas transportadoras activas durante la pelea, afectando el posicionamiento de ambos.

---

## Nivel 9 — "El Castillo de Sal y Vinagre"
**Historia**: la antesala del Rey Amargo. Es el nivel "de repaso" — el jugador demuestra que domina todo lo aprendido.

**Biomas**: remezcla deliberada — A) pasillo helado-pegajoso (regaliz + hielo) · B) foso con marea ácida · C) salón del trono previo (arena doble).

**Mecánica**: no introduce mecánica nueva; **combina** terreno pegajoso, hielo, mareas y cintas en set-pieces cortos — es un gauntlet de memoria muscular, clásico en juegos de este género antes del final.

**Enemigos**: versiones `ÉLITE` (+stats, +un ataque extra) de ROLLER, SNIPER, MOTH, KNIGHT, LATIGO, ROBOT_AMARGO — más el nuevo `GUARDIA_REAL` (combina el escudo del KNIGHT con la carga del ROLLER).

**Arma nueva**: `ESCUDO_DE_CARAMELO` — power-up temporal de invulnerabilidad + reflejo de proyectiles, pensado justo para este gauntlet.

**Jefe**: **Sal & Vinagre** — dos jefes gemelos simultáneos (1100 HP cada uno) que se potencian mutuamente si están cerca; hay que separarlos en la arena o golpearlos en una ventana sincronizada. Primer jefe doble del juego, sube la dificultad sin subir solo un número de HP.

---

## Nivel 10 — "El Trono Amargo" (final)
**Historia**: el Rey Amargo, cara a cara. Cierre del arco de redención: al vencerlo, no lo destruyes — se disuelve la amargura y el reino (y la Reina de Azúcar, si quieres traerla de vuelta como aliada en un cameo) vuelve a la dulzura.

**Mecánica**: arena que **cambia físicamente entre fases**, referenciando visualmente niveles anteriores (el suelo se vuelve de regaliz, luego hielo, luego cinta transportadora) — barato de producir porque reutilizas los assets/paletas que ya hiciste para 4-9, pero se siente como un "greatest hits" narrativo.

**Jefe**: **El Rey Amargo** (~3000 HP repartidos en 4 fases):
- Fase 1: ataques directos, arena "normal".
- Fase 2: invoca el hazard de regaliz + ácido del nivel 4-5.
- Fase 3: arena helada con plataformas `crumbling`, ritmo más rápido.
- Fase 4 (overdrive, <15% HP): combina un pequeño homenaje a cada mecánica anterior en una arena que se reconstruye en tiempo real; aquí es donde brilla el arsenal completo del jugador.

Sin enemigos nuevos — solo oleadas cortas de enemigos ya conocidos entre fases, para que el foco esté 100% en el jefe.

---

## Otras ideas que añadiría (no pedidas explícitamente)

- **Mini-diálogos entre niveles**: 2-3 viñetas con el `Modal` que ya tienes, antes/después de cada jefe, para llevar la historia sin animación cara.
- **Selector de nivel en mapa**: en vez de solo `startingLevel` numérico, un mapa visual con nodos desbloqueados — refuerza la sensación de progreso para niños y encaja con que ya tienes `previewLevel`.
- **Modo fácil**: dado que es una app educativa infantil, un toggle que reduzca HP/daño de enemigos (multiplicador global, similar al `*1.25` que ya usas pero al revés) sin tocar el diseño de niveles.
- **Coleccionables secundarios** (estrellas/monedas) por nivel, guardados en Supabase por perfil de niño — rejugabilidad sin más niveles.
- **Contraste de color para daltonismo**: con tantos biomas por gradiente, vale la pena diferenciar hazards por forma/icono además de color (charco ácido con textura de burbujas, hielo con patrón de grietas), no solo por paleta.

---

## Orden de trabajo sugerido para Antigravity/Gemini
1. Refactor del registro de niveles (una vez, antes de tocar contenido).
2. Nivel 4 completo (config + enemigos + jefe) como plantilla de referencia para los siguientes.
3. Niveles 5-8 en paralelo, reusando el patrón del 4.
4. Nivel 9 (gauntlet) al final, cuando 4-8 ya estén balanceados, porque depende de ellos.
5. Nivel 10 al final de todo — su arena remezcla assets de los anteriores.
