# 🔢 Calculadora PWA de Métodos Numéricos

Aplicación Web Progresiva (PWA) de alto rendimiento para la resolución y visualización interactiva de métodos numéricos. Desarrollada con **React 19**, **Vite 8**, **Tailwind CSS v4**, **mathjs** y **vite-plugin-pwa**.

## 🎓 Información Académica
- **Materia:** Métodos Numéricos
- **Programa:** Ingeniería de Software (Séptimo Semestre)
- **Institución:** FESC (Fundación de Estudios Superiores Comfanorte) 2026-2
- **Integrantes:**
  - Andrés Esteban Sandoval Carreño
  - Jhoan Sebastian Celis Pabón
  - Zharick Nicolle Acevedo Ascanio

---

## 🧮 Métodos Numéricos Implementados
1. **Método Iterativo Secuencial:** Iteración de Punto Fijo $x = g(x)$ con control del criterio de convergencia $|g'(x)| < 1$.
2. **Método de Newton para Sistemas:** Solución de sistemas no lineales mediante Matriz Jacobiana $\mathbf{J}(\mathbf{x})$ y corrección $\Delta \mathbf{x}$.
3. **Método de Bairstow:** Cálculo sistemático de raíces reales y complejas ($a \pm bi$) de polinomios mediante deflación cuadrática.

---

## 📁 Documentación del Proyecto
Toda la documentación técnica y pedagógica está centralizada en la carpeta [`docs/`](./docs/README.md):
- 💡 [Idea del Proyecto y Alcance](./docs/IDEA_DEL_PROYECTO.md)
- 📐 [Plan de Implementación y Arquitectura](./docs/PLAN_DE_IMPLEMENTACION.md)
- 📜 [Reglas y Convenciones de Código](./docs/REGLAS_Y_CONVENCIONES.md)
- 🤖 [Prompt para Claude Code](./docs/PROMPT_CLAUDE_CODE.md)

---

## 🚀 Puesta en Marcha

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Generar bundle de producción y PWA
npm run build
```
