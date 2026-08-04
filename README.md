# ruby.pizza

Sitio estático de una sola página + la carta en PDF, construidos sobre las fotos
y los logos de `Ruby imagenes/`.

```
ruby.pizza/
├─ site/                    ← esto es lo que se despliega
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  ├─ vercel.json
│  ├─ assets/{img,logo,fonts,video}/
│  └─ menu/
│     ├─ menu.html               fuente de la carta
│     └─ menu-ruby-pizza.pdf     PDF generado (A4, 1 página, ~580 KB)
├─ build-menu.mjs           genera el PDF desde menu.html
├─ Ruby imagenes/           originales (no se despliegan)
└─ Ruby imagenes.rar, *.mp4 originales (no se despliegan)
```

## Desplegar en Vercel

El sitio es HTML/CSS/JS plano: **no hay build**. En Vercel:

| Ajuste | Valor |
| --- | --- |
| Framework Preset | **Other** |
| Root Directory | **`site`** |
| Build Command | *(vacío)* |
| Output Directory | *(vacío)* |

Poner `site` como Root Directory es lo importante: deja fuera del despliegue el
`.rar` (17 MB) y el video (61 MB) que están en la raíz.

Desde la terminal:

```bash
cd site && vercel        # preview
cd site && vercel --prod # producción
```

`site/vercel.json` ya trae `cleanUrls`, cache inmutable de un año para
`/assets/*` y cabeceras de seguridad básicas.

Después de conectar el dominio, revisar que `ruby.pizza` sea el dominio
principal: las URLs canónicas, el sitemap y las etiquetas Open Graph apuntan ahí.

## Ver el sitio en local

```bash
npm run dev      # http://localhost:4321
```

## Regenerar la carta en PDF

`menu.html` usa rutas absolutas (`/assets/...`), así que necesita el sitio
servido:

```bash
npm install      # una vez, trae puppeteer-core
npm run dev      # en otra terminal
npm run menu     # escribe site/menu/menu-ruby-pizza.pdf
```

`build-menu.mjs` usa el Chrome del sistema (`/usr/bin/google-chrome`). Si está en
otra ruta, ajustar `executablePath` en ese archivo.

Para editar la carta se toca solo `site/menu/menu.html` y se vuelve a correr
`npm run menu`.

## Marca

| | |
| --- | --- |
| Rojo | `#A6192E` — muestreado del logo original |
| Rojo claro (hover, acentos) | `#C8243C` |
| Negro | `#0B0B0C` |
| Hueso | `#F2EFE9` |
| Display | Rokkitt (variable, 100–900) — slab tipo Rockwell, hermana del logotipo |
| Texto | Poppins 300/400/500/600 |

Las fuentes están alojadas en `site/assets/fonts/` (no se llama a Google Fonts),
así que el sitio y el PDF renderizan igual y sin depender de terceros.

El damero blanco y negro que aparece en las franjas viene del papel de las
fotos; el resplandor cálido detrás del hero y en la esquina de la carta imita la
llama del horno.

## Contenido

Las cuatro ediciones (`Origin`, `Midnight Bacon`, `Red Smoke`, `Pepperoni`) están
escritas a mano en `site/index.html` y en `site/menu/menu.html`. Si cambia una
receta hay que tocar los dos archivos y regenerar el PDF.

**Falta definir:** precios, horario de atención y dirección/zona de reparto. No
venían en el menú original, así que no aparecen en ninguna parte todavía.

## Video del hero

`site/assets/video/` sale del MP4 original de WhatsApp (1080×1920 vertical, 60 fps,
61 MB) recomprimido a H.264:

| Archivo | Formato | Peso |
| --- | --- | --- |
| `hero.mp4` | 1280×720, recorte central 16:9 | 2,2 MB |
| `hero-mobile.mp4` | 608×1080, vertical original | 970 KB |

`app.js` elige cuál cargar según el ancho de pantalla, así que **solo se descarga
uno**. La foto del hero queda debajo haciendo de póster: si el navegador bloquea
el autoplay, el usuario tiene ahorro de datos activado o pide movimiento
reducido, no se pide un solo byte de video y se queda la foto. El video también
se pausa cuando el hero sale de pantalla.

Va bastante oscurecido por CSS (`filter: brightness(.58)`) porque el material
original está muy quemado de naranjo y si no el logotipo no se lee encima.

Para regenerarlo con otro recorte hace falta `ffmpeg`:

```bash
ffmpeg -i "WhatsApp Video ....mp4" \
  -vf "crop=1080:608:0:540,scale=1280:720,setsar=1,fps=30" -an \
  -c:v libx264 -profile:v high -preset slow -crf 27 \
  -pix_fmt yuv420p -movflags +faststart site/assets/video/hero.mp4
```

El `crop` toma una franja de 608 px de alto a partir del píxel 540: es donde
queda la pizza. El `setsar=1` importa — el original trae un aspecto de píxel
1215:1216 que si no deja el video estirado un 0,1%.

## Fotos

`site/assets/img/` tiene versiones WebP optimizadas (~3 MB en total) generadas
desde `Ruby imagenes/`. Los originales JPG quedan intactos.

| Archivo | Uso |
| --- | --- |
| `hero.webp` / `hero-mobile.webp` | Portada (horno con la llama) |
| `ed-0X-*.webp` | Tarjeta de cada edición |
| `menu-0X.jpg` | Miniaturas de la carta PDF (recortadas para impresión) |
| `proceso-X.webp` | Masa: fermentación, estirado, horno |
| `g-XX.webp` | Galería (12 fotos) |
| `og.jpg` | Imagen para redes (1200×630) |
