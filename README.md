# Misión Fracción: una aventura matemática

Objeto Virtual de Aprendizaje (OVA) para fracciones en grado quinto. Construido con **Astro + React + TypeScript**, compilado de forma estática (`dist/`), sin cuentas, sin backend y sin servicios externos.

> «Cuatro misiones, un universo de fracciones por descubrir».

## Requisitos

- Node.js 20.18 o superior
- npm

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo
npm test           # pruebas automatizadas (Vitest)
npm run build      # verificación de tipos + compilación de producción en dist/
npm run preview    # servir dist/ localmente
```

## Estructura

| Ruta | Contenido |
|---|---|
| `src/pages/` | Páginas Astro: portada, instrucciones, mapa, misiones (`mision/[id]`), repaso, reconocimiento |
| `src/layouts/` | Estructura visual compartida |
| `src/components/game/` | Componentes React: `GameApp` (coordinador), pantallas, actividades, visuales SVG, Fracti |
| `src/data/activities.ts` | **Banco de actividades** (20 desafíos) |
| `src/data/missions.ts` | Misiones, escenarios, insignias, cristales y explicaciones |
| `src/data/messages.ts` | Textos de retroalimentación y de la interfaz |
| `src/data/types.ts` | Tipos de actividades (contrato de datos) |
| `src/lib/fraction.ts` | Motor matemático exacto con enteros (simplificar, equivalencia, comparar, sumar, restar, MCD, MCM) |
| `src/lib/validate.ts` | Validación de respuestas y respuesta canónica de cada actividad |
| `src/lib/progress.ts` | Progreso, estrellas, desbloqueo y lectura segura de localStorage |
| `src/lib/catalog.ts` | Consultas sobre el orden de actividades |
| `tests/` | Pruebas de la matemática, del banco de actividades y del progreso |

## Editar el banco de actividades

Cada actividad en `src/data/activities.ts` tiene: `id`, `mission`, `type`, `title`, `objective`, `prompt`, `hint`, `explanation`, un `visual` opcional y los campos propios de su tipo:

| `type` | Interacción | Campos de respuesta |
|---|---|---|
| `choice` | Selección múltiple | `options`, `correctIndex` |
| `match` | Emparejamiento (toque) | `left`, `right`, `correctPairs` |
| `order` | Ordenar con botones ▲ ▼ | `items` (se ordenan de menor a mayor) |
| `shade` | Colorear partes de una barra | `parts`, `target` |
| `numberline` | Elegir punto en recta numérica | `max`, `denominator`, `target` |
| `fill` | Escribir numerador y denominador | `expected`, `mode` (`exact`, `equivalent`, `simplest`) |

Después de editar, ejecute `npm test`. Las pruebas comprueban que:

- cada actividad tiene todos sus campos pedagógicos;
- la respuesta correcta de cada actividad es válida (`solutionOf` + `evaluateAnswer`);
- las parejas y opciones son consistentes;
- las operaciones esperadas coinciden con la suma/resta exacta.

Los textos de error y las explicaciones se editan en `src/data/messages.ts` y en cada actividad.

## Reglas matemáticas

- Solo fracciones con numerador entero ≥ 0 y denominador entero ≥ 1.
- Sin decimales: comparaciones por multiplicación cruzada, sumas con mínimo común múltiplo.
- La resta no admite resultados negativos.
- Las actividades de «forma más simple» exigen irreducibilidad.
- No se incluyen multiplicación o división de fracciones, porcentajes ni decimales.

## Progreso y privacidad

- El progreso se guarda en `localStorage` con la clave `mision-fraccion:progreso:v1`. No hay cuentas ni datos enviados a ningún servidor.
- Los datos leídos de `localStorage` se validan con una lista blanca de identificadores; cualquier valor inválido se descarta.
- Las estrellas son recursos de gamificación. No son calificaciones ni mediciones de motivación.
- Repasar una actividad ya resuelta no modifica el progreso.
- Reiniciar el progreso requiere confirmación en dos pasos.

## Investigación

El OVA es la intervención pedagógica de una investigación doctoral. No incorpora pretest, postest ni el cuestionario SRQ-A como actividades: esos instrumentos se aplican según el protocolo aprobado. Las 4 misiones son bloques pedagógicos que el docente puede dosificar; la organización orientativa es de seis sesiones, sin tiempos impuestos.

## Publicar en alojamiento estático

1. `npm run build` genera `dist/`.
2. Suba el contenido de `dist/` a cualquier alojamiento estático (GitHub Pages, Netlify, Cloudflare Pages, un servidor web).
3. Si el sitio se publica en una subcarpeta (p. ej. `https://ejemplo.edu/ova/`), defina `base: '/ova/'` en `astro.config.mjs`. Todas las rutas internas usan `src/lib/paths.ts` y se ajustan automáticamente.
4. Las cabeceras de seguridad (CSP, HSTS, etc.) deben configurarse en el servidor o la plataforma de alojamiento, no en la aplicación.

## Accesibilidad

- Todas las interacciones usan botones y campos de texto: funcionan con teclado, ratón y pantalla táctil.
- El arrastrar y soltar no se usa; la ordenación se hace con botones.
- Las representaciones SVG tienen `aria-label` descriptivo.
- Retroalimentación en `role="status"` (lectores de pantalla).
- Animaciones moderadas y desactivadas con `prefers-reduced-motion`.
- Sin sonidos automáticos.
