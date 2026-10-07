# 💡 Idea y Alcance del Proyecto: PWA Métodos Numéricos (Taller 2)

## 📌 1. Información General
* **Asignatura:** Métodos Numéricos
* **Institución:** FESC (Fundación de Estudios Superiores Comfanorte) - Semestre 2026-2
* **Programa:** Ingeniería de Software
* **Nivel:** Séptimo Semestre
* **Equipo de Desarrollo:**
  - **Andrés Esteban Sandoval Carreño**
  - **Jhoan Sebastian Celis Pabón**
  - **Zharick Nicolle Acevedo Ascanio**

---

## 🎯 2. Visión del Proyecto
Desarrollar una **Progressive Web App (PWA)** de vanguardia orientada al aprendizaje y validación práctica de algoritmos numéricos. La aplicación no solo se comporta como una calculadora científica avanzada, sino también como un **laboratorio didáctico e interactivo** que muestra el desglose matemático paso a paso de cada iteración, facilitando a estudiantes y docentes la verificación de talleres y exámenes.

Al ser una **PWA**, la herramienta ofrece:
- **Instalabilidad:** Puede instalarse como aplicación nativa en dispositivos móviles (Android/iOS) y de escritorio (Windows/macOS/Linux).
- **Funcionamiento Offline:** Capacidad de operar al 100% sin conexión a internet mediante Service Workers y caché local.
- **Rendimiento Ultrarrápido:** Construida sobre Vite 8, React 19 y Tailwind CSS v4 para una experiencia fluida sin recargas.

---

## 🔬 3. Temas y Métodos Numéricos Incluidos

### 🔹 Método 1: Método Iterativo Secuencial (Punto Fijo $x = g(x)$)
- **Concepto:** Transformación de la ecuación original $f(x) = 0$ a una formulación recursiva $x = g(x)$.
- **Aporte Diferencial:** 
  - Verificación matemática previa del teorema de convergencia mediante el cálculo de la derivada inicial: $|g'(x_0)| < 1$.
  - Alerta dinámica de convergencia / divergencia.
  - Tabla de control iterativo con errores absoluto ($E_a$) y relativo porcentual ($E_r\%$).

### 🔹 Método 2: Método de Newton-Raphson para Sistemas (Matriz Jacobiana)
- **Concepto:** Resolución de sistemas de ecuaciones simultáneas no lineales $\mathbf{F}(\mathbf{x}) = \mathbf{0}$.
- **Aporte Diferencial:**
  - Soporte para sistemas $2 \times 2$ y $3 \times 3$.
  - Generación de la Matriz Jacobiana $\mathbf{J}(\mathbf{x})$ tanto con derivadas analíticas como numéricas.
  - Alerta de singularidad cuando $\det(\mathbf{J}) \approx 0$.
  - Desglose del vector de corrección $\Delta \mathbf{x}$ y norma euclidiana de error $\|\Delta \mathbf{x}\|$.

### 🔹 Método 3: Método de Bairstow (Raíces de Polinomios)
- **Concepto:** Extracción sistemática de factores cuadráticos $x^2 - rx - s$ de un polinomio arbitrario mediante división sintética doble y corrección iterativa de $r$ y $s$.
- **Aporte Diferencial:**
  - Soporte completo para **raíces reales y números complejos conjugados ($a \pm bi$)**.
  - Deflación polinómica sucesiva automática hasta encontrar todas las raíces del polinomio.
  - Tabla de convergencia de los coeficientes de corrección $\Delta r$ y $\Delta s$.

---

## 💎 4. Principios de Diseño y Experiencia de Usuario (UX/UI)
1. **Estética Científica Moderna ("Dark Laboratory"):** Fondo oscuro elegante (`#090d16` / `#0f172a`), contrastes limpios y acentos de color con significado semántico (verde para convergencia, rojo/ámbar para alertas o singularidades, azul/cian para valores iterados).
2. **Carga Rápida de Casos Típicos:** Botones de acceso rápido ("Presets Académicos") para cargar con un clic los problemas clásicos de libros como Chapra & Canale o Burden & Faires.
3. **Exportabilidad:** Opción de exportar las tablas iterativas a formato CSV para su uso en hojas de cálculo o informes académicos.
