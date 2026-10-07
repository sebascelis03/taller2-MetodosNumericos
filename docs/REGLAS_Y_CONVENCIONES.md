# 📜 Reglas, Convenciones y Estándares de Desarrollo

Este documento define las reglas de codificación, arquitectura y estilo para el proyecto **Calculadora PWA de Métodos Numéricos (Taller 2 - FESC 2026-2)**.

---

## 🏛️ 1. Estándares de Arquitectura y Código

### 🔹 1.1 Separación Estricta de Capas
- **Capa Matemática Pura (`src/methods/`):**
  - Debe contener funciones puras de JavaScript sin dependencias de React ni del DOM.
  - Cada función debe retornar un objeto estandarizado con la siguiente firma:
    ```js
    {
      success: boolean,
      iterations: Array<object>,
      totalIterations: number,
      finalError: number,
      message: string,
      // Propiedades específicas del método (root, solution, roots, etc.)
    }
    ```
  - Manejar excepciones con bloques `try / catch` para evitar que fallos matemáticos o entradas no válidas rompan la aplicación.
- **Capa de Componentes UI (`src/components/`):**
  - Componentes funcionales limpios con React 19.
  - Validación de inputs antes de invocar los métodos matemáticos.
  - Retroalimentación clara con spinners, alertas y desgloses de error.

### 🔹 1.2 Reglas para Manejo Numérico y Matemático
- Usar `mathjs` para compilar y evaluar expresiones matemáticas ingresadas por el usuario.
- Siempre comprobar divisiones por cero, indeterminaciones (`NaN`) y números infinitos (`Infinity`).
- Al formatear números en tablas o resúmenes, utilizar notación científica (`.toExponential(4)`) para números extremadamente pequeños ($< 10^{-4}$) o de alta precisión (`.toFixed(6)`).

---

## 🎨 2. Reglas de Estilo y UI (Tailwind CSS v4)
- **Tema:** Dark Mode por defecto con base en Slate (`bg-slate-950`).
- **Cards y Contenedores:** Estilo glassmorphism usando `bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl`.
- **Tipografía:**
  - Texto principal: `font-sans` (Inter / system-ui).
  - Fórmulas, tablas, matrices y números: `font-mono` (Fira Code / Consolas).
- **Consistencia de Botones:**
  - Botón primario de cálculo: Fondo degradado `bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-indigo-500/20`.
  - Botón secundario / preset: `bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60`.

---

## 📱 3. Estándares para la PWA (Progressive Web App)
- Los assets del Service Worker y Manifest deben permanecer sincronizados en `vite.config.js`.
- Los iconos vectoriales SVG en `public/` deben mantenerse con resoluciones nítidas y soporte `maskable`.
- La aplicación debe ser 100% responsiva (Mobile First) y soportar pantallas táctiles, tablets y escritorios sin desbordamiento horizontal (`overflow-x-auto` en tablas).

---

## 🌿 4. Convenciones Git y Commits
- `feat:` Nuevas características o componentes UI.
- `math:` Mejoras o ajustes a los algoritmos de métodos numéricos.
- `fix:` Corrección de errores de cálculo o renderizado.
- `docs:` Actualizaciones de documentación en la carpeta `docs/`.
- `style:` Ajustes cosméticos o estilos de Tailwind.
