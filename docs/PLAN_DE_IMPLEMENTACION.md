# 📐 Plan de Implementación: PWA Calculadora de Métodos Numéricos

**Materia:** Métodos Numéricos  
**Institución:** FESC 2026-2  
**Programa:** Ingeniería de Software (Séptimo Semestre)  
**Integrantes:**
- Andrés Esteban Sandoval Carreño
- Jhoan Sebastian Celis Pabón
- Zharick Nicolle Acevedo Ascanio

---

## 🎯 Objetivo General
Construir una **Progressive Web App (PWA)** de alta fidelidad, interactiva, moderna y offline-ready que resuelva, grafique y detalle paso a paso los 3 métodos numéricos asignados:
1. **Método Iterativo Secuencial** (Punto Fijo $x = g(x)$ y convergencia).
2. **Método de Newton para Sistemas No Lineales** (con Matriz Jacobiana $2 \times 2$ y $3 \times 3$).
3. **Método de Bairstow** (Raíces reales y complejas de polinomios por deflación cuadrática).

---

## 🏗️ Arquitectura Técnica del Proyecto

```
taller2-MetodosNumericos/
├── public/
│   ├── pwa-192x192.svg           # Icono PWA responsivo
│   ├── pwa-512x512.svg           # Icono PWA alta resolución
│   └── favicon.svg
├── src/
│   ├── assets/                   # Recursos visuales y diagramas
│   ├── components/               # Componentes UI modulares
│   │   ├── Navbar.jsx            # Header con datos de FESC, estudiantes y botón PWA Install
│   │   ├── MethodTabs.jsx        # Selector de pestañas para los 3 métodos
│   │   ├── ParameterCard.jsx     # Tarjetas de inputs, tolerancias y variables
│   │   ├── IterationTable.jsx    # Tablas detalladas paso a paso con error relativo/absoluto
│   │   ├── MatrixDisplay.jsx     # Renderizado matemático de Jacobiano y sistemas lineales
│   │   ├── RootsCard.jsx         # Desglose de raíces reales y complejas
│   │   ├── ConvergenceAlert.jsx  # Advertencias (|g'(x)| < 1, singularidad, divergencia)
│   │   └── Footer.jsx            # Créditos del equipo y semestre
│   ├── methods/                  # Núcleo de cálculo numérico puro
│   │   ├── sequentialIteration.js # Motor del Método Iterativo Secuencial
│   │   ├── newtonSystem.js       # Motor de Newton para Sistemas (Jacobiano)
│   │   └── bairstow.js           # Motor de Bairstow (Polinomios y complejos)
│   ├── App.jsx                   # Componente orquestador principal
│   ├── index.css                 # Configuración Tailwind CSS v4 y tema oscuro
│   └── main.jsx                  # Entrada principal React 19
├── index.html                    # Meta tags PWA, fuentes Google Fonts (Inter, Fira Code)
├── vite.config.js                # Vite 8 + Tailwind v4 + VitePWA
└── package.json                  # Dependencias (mathjs, lucide-react, etc.)
```

---

## 📋 Desglose Metodológico de los 3 Métodos

### 1. Método Iterativo Secuencial
* **Fundamento Matemático:** Dada una ecuación $f(x) = 0$, se despeja una forma equivalente $x = g(x)$. La sucesión generada es $x_{k+1} = g(x_k)$.
* **Criterio de Convergencia:** Teorema de Punto Fijo: si $|g'(x)| < 1$ en el entorno de la raíz, el método converge. Si $|g'(x)| > 1$, diverge.
* **Funcionalidades UI:**
  - Selector de funciones preconfiguradas y entrada libre (ej: `exp(-x)`, `sqrt(10 - x^3)`, `(x + 2/x)/2`).
  - Verificación automática de la derivada inicial $g'(x_0)$ con badge de diagnóstico (Verde: Convergerá, Amarillo: Riesgo de Divergencia).
  - Tabla de iteraciones: $k$, $x_k$, $x_{k+1}$, $E_a$, $E_r (\%)$.
  - Gráfica conceptual/comparativa de la convergencia.

### 2. Método de Newton para Sistemas (Matriz Jacobiana)
* **Fundamento Matemático:** Resolver $\mathbf{F}(\mathbf{x}) = \mathbf{0}$ para $\mathbf{x} = [x_1, x_2, \dots, x_n]^T$.
  $$\mathbf{J}(\mathbf{x}^{(k)}) \cdot \Delta \mathbf{x}^{(k)} = -\mathbf{F}(\mathbf{x}^{(k)})$$
  $$\mathbf{x}^{(k+1)} = \mathbf{x}^{(k)} + \Delta \mathbf{x}^{(k)}$$
* **Matriz Jacobiana:**
  $$J_{ij} = \frac{\partial f_i}{\partial x_j}$$
* **Funcionalidades UI:**
  - Soporte para sistemas $2 \times 2$ y $3 \times 3$ con presets académicos clásicos (círculo e hipérbola, sistemas trigonométricos/exponenciales).
  - Visualización del Jacobiano simbólico y su evaluación numérica en cada paso.
  - Alerta de Jacobiano singular si $\det(\mathbf{J}) \approx 0$.
  - Desglose del vector de residuos $\mathbf{F}(\mathbf{x})$, vector de corrección $\Delta \mathbf{x}$ y norma euclidiana del error $\|\Delta \mathbf{x}\|$.

### 3. Método de Bairstow (Polinomios)
* **Fundamento Matemático:** Descomponer un polinomio $P(x)$ de grado $n$ mediante división sintética entre factores cuadráticos $x^2 - rx - s$.
  - Residuos $b_0(r,s)$ y $b_1(r,s)$.
  - Correcciones por derivadas parciales sintéticas (coeficientes $c$):
    $$\begin{bmatrix} c_2 & c_3 \\ c_1 & c_2 \end{bmatrix} \begin{bmatrix} \Delta r \\ \Delta s \end{bmatrix} = \begin{bmatrix} -b_1 \\ -b_0 \end{bmatrix}$$
  - Raíces cuadráticas: $x_{1,2} = \frac{r \pm \sqrt{r^2 + 4s}}{2}$ (soporte completo para números complejos $a \pm bi$).
  - Deflación del polinomio sucesiva hasta reducir a grado 2 o 1.
* **Funcionalidades UI:**
  - Entrada amigable de polinomios (por coeficientes directos o formato polinomio `x^4 - 3.5x^3 + 2.75x^2...`).
  - Tabla de iteraciones de refinamiento de $r$ y $s$.
  - Visualización del árbol o etapas de deflación cuadrática.
  - Listado clasificado de raíces reales y raíces imaginarias complejas conjugadas.

---

## 🎨 Especificaciones de Diseño y Experiencia de Usuario (PWA)
1. **Paleta Visual Moderna (Dark Mode Premium):**
   - Fondo: `#090d16` a `#0f172a` (Slate ultra oscuro).
   - Acentos: Índigo (`#6366f1`), Cian (`#06b6d4`), Esmeralda (`#10b981`), Ámbar (`#f59e0b`).
   - Cards y Glassmorphism: Fondos translúcidos con bordes sutiles `border-slate-800/80` y `backdrop-blur-md`.
2. **Encabezado Institucional:**
   - Badge "FESC 2026-2 | Séptimo Semestre | Ingeniería de Software".
   - Integrantes claramente destacados con avatares o chips elegantes.
3. **PWA Offline e Instalable:**
   - Botón interactivo para instalar la aplicación directamente en Android, iOS o Windows.
   - Indicador de estado de conexión (Online / Offline).
4. **Exportación de Resultados:**
   - Botón para exportar la tabla de iteraciones a CSV o copiar al portapapeles.
