# MASTER PROMPT PARA CLAUDE CODE 🚀

Copia y pega el siguiente prompt directamente en tu sesión de **Claude Code** para que construya e integre toda la interfaz gráfica de usuario (UI), componentes visuales, PWA y flujo completo:

```markdown
Eres un desarrollador Frontend experto en React, Tailwind CSS y Métodos Numéricos. Tu misión es completar y elevar al máximo nivel estético y funcional la aplicación web progresiva (PWA) para el Taller 2 de Métodos Numéricos de la FESC.

### 📌 CONTEXTO ACADÉMICO Y EQUIPO:
- Materia: Métodos Numéricos
- Institución: FESC 2026-2
- Carrera: Ingeniería de Software (Séptimo Semestre)
- Integrantes del Grupo:
  1. ANDRÉS ESTEBAN SANDOVAL CARREÑO
  2. JHOAN SEBASTIAN CELIS PABÓN
  3. ZHARICK NICOLLE ACEVEDO ASCANIO

### ⚙️ ESTADO ACTUAL DEL PROYECTO:
El proyecto ya cuenta con la base técnica instalada y configurada:
- Vite 8 + React 19 + Tailwind CSS v4 (`@tailwindcss/vite`).
- PWA configurada en `vite.config.js` (`vite-plugin-pwa`) con Service Worker `autoUpdate` e iconos en `public/`.
- Dependencias instaladas: `lucide-react`, `mathjs`, `vite-plugin-pwa`, `tailwindcss`.
- Los 3 motores matemáticos puros ya están implementados y verificados en:
  1. `src/methods/sequentialIteration.js` (Método Iterativo Secuencial / Punto Fijo con diagnóstico |g'(x)| < 1)
  2. `src/methods/newtonSystem.js` (Método de Newton para Sistemas con Matriz Jacobiana 2x2 y 3x3)
  3. `src/methods/bairstow.js` (Método de Bairstow con deflación polinómica y raíces reales/complejas)

### 🎯 TU OBJETIVO:
Desarrollar la interfaz de usuario completa, reactiva, elegante y profesional en `src/`, creando los componentes necesarios e integrándolos en `src/App.jsx`.

### 🧩 COMPONENTES A IMPLEMENTAR:

1. **`src/components/Header.jsx`**:
   - Título principal: "Calculadora de Métodos Numéricos".
   - Badges institucionales: "FESC 2026-2", "Ingeniería de Software", "Séptimo Semestre".
   - Visualización moderna de los 3 estudiantes con avatares o chips estéticos.
   - Botón de instalación PWA (`Instalar App`) aprovechando el evento `beforeinstallprompt` del navegador.
   - Indicador de estado de conexión (En línea / Sin conexión).

2. **`src/components/Tabs.jsx`**:
   - Selector entre los 3 métodos:
     * 1. Iterativo Secuencial
     * 2. Newton para Sistemas (Jacobiano)
     * 3. Método de Bairstow
   - Indicador visual suave con iconos de `lucide-react`.

3. **`src/components/SequentialCalculator.jsx`**:
   - Entradas para $g(x)$, $x_0$, tolerancia, número máximo de iteraciones y tipo de error (relativo % o absoluto).
   - Botones con "Ejemplos Predefinidos" para cargar casos de prueba con 1 clic (ej: $g(x) = e^{-x}$, $g(x) = \sqrt{10 - x^3}$, $g(x) = \frac{x + 2/x}{2}$).
   - Banner de advertencia de convergencia: evalúa numéricamente $|g'(x_0)|$ e indica si cumple la condición suficiente de convergencia $|g'(x)| < 1$.
   - Tarjeta de resultado final destacada (Raíz aproximada, iteraciones requeridas, error alcanzado).
   - Tabla interactiva con columnas: $k$, $x_k$, $x_{k+1}$, $E_a$, $E_r (\%)$, y botón para exportar los datos a CSV.

4. **`src/components/NewtonSystemCalculator.jsx`**:
   - Selector para sistemas $2 \times 2$ o $3 \times 3$.
   - Inputs dinámicos para las ecuaciones $f_1, f_2, (f_3) = 0$ y valores iniciales.
   - Ejemplos predeterminados con un clic (ej: intersección círculo-recta, sistema no lineal cuadrático).
   - Renderizado visual de la Matriz Jacobiana $J(x)$ calculada en cada paso.
   - Detección y alerta visual en caso de Jacobiano singular ($\det(J) \approx 0$).
   - Tabla de iteraciones con vector de aproximación, vector de residuos $F(X)$, corrección $\Delta X$ y norma del error euclidiano.

5. **`src/components/BairstowCalculator.jsx`**:
   - Entrada de coeficientes de mayor a menor grado (o selector rápido de grado con inputs individuales para cada coeficiente $a_n, a_{n-1}, \dots, a_0$).
   - Inputs para valores iniciales $r, s$, tolerancia y máximo de iteraciones.
   - Ejemplos clásicos de polinomios (con raíces reales y raíces complejas conjugadas).
   - Resumen visual en tarjetas de todas las raíces calculadas clasificando: Reales vs. Complejas ($a \pm bi$).
   - Desglose por etapas de deflación cuadrática y tabla detallada de iteraciones de refinamiento de $r$ y $s$.

6. **`src/components/Footer.jsx`**:
   - Información de créditos, autoría y mención a la cátedra de Métodos Numéricos.

### 🎨 REQUISITOS DE DISEÑO (Tailwind CSS v4):
- Look & feel "Dark Tech / Scientific Dashboard": fondo `bg-slate-950`, tarjetas en `bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm`, textos nítidos en `text-slate-100` y `text-slate-400`.
- Acentos vibrantes: `indigo-500`, `cyan-500`, `emerald-500`, `amber-500`.
- Totalmente responsivo para móviles, tablets y pantallas de escritorio.
- PWA totalmente funcional y offline-first.

Procede a crear estos componentes, actualizar `App.jsx`, verificar que la compilación con `npm run build` sea limpia y exitosa, y presentar la aplicación en ejecución.
```
