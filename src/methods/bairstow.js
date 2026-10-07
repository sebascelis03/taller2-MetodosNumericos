/**
 * Método de Bairstow para el cálculo de raíces reales y complejas de polinomios.
 * Encuentra factores cuadráticos (x^2 - r*x - s) mediante iteración sintética y deflación.
 * 
 * @param {Array<number>} coefficients - Coeficientes de MAYOR a MENOR grado: [a_n, a_{n-1}, ..., a_1, a_0]
 *                                       Internamente se invierten a orden ascendente (a[i] = coef. de x^i)
 *                                       porque las recurrencias sintéticas b/c se indexan por grado.
 * @param {number} initialR - Valor inicial de r (por defecto -1 o 0)
 * @param {number} initialS - Valor inicial de s (por defecto -1 o 0)
 * @param {number} tol - Tolerancia de error para r y s (ej: 1e-5)
 * @param {number} maxIter - Máximo de iteraciones por factor cuadrático
 * @returns {object} Lista de todas las raíces, factores cuadráticos, iteraciones y deflación
 */
export function solveBairstow(coefficients, initialR = 0.5, initialS = 0.5, tol = 1e-5, maxIter = 100) {
  try {
    // Limpiar coeficientes ceros de mayor grado (entrada en orden descendente)
    const descending = [...coefficients.map(Number)];
    while (descending.length > 0 && Math.abs(descending[0]) < 1e-12) {
      descending.shift();
    }

    if (descending.some((coef) => !Number.isFinite(coef))) {
      throw new Error('Todos los coeficientes deben ser números reales finitos.');
    }

    // Representación interna ASCENDENTE: a[i] es el coeficiente de x^i.
    // Las recurrencias sintéticas b[i] / c[i] se indexan por grado.
    let a = [...descending].reverse();

    let n = a.length - 1; // Grado del polinomio
    if (n < 1) {
      throw new Error('El polinomio debe tener al menos grado 1.');
    }

    const workingDegree = n;

    const roots = [];
    const quadraticFactors = [];
    const stages = [];
    let stageNumber = 1;

    while (n >= 3) {
      let r = Number(initialR);
      let s = Number(initialS);
      let iter = 0;
      let factorConverged = false;
      const stageIterations = [];

      while (iter < maxIter) {
        iter++;

        // Array b
        const b = new Array(n + 1).fill(0);
        b[n] = a[n];
        b[n - 1] = a[n - 1] + r * b[n];
        for (let i = n - 2; i >= 0; i--) {
          b[i] = a[i] + r * b[i + 1] + s * b[i + 2];
        }

        // Array c
        const c = new Array(n + 1).fill(0);
        c[n] = b[n];
        c[n - 1] = b[n - 1] + r * c[n];
        for (let i = n - 2; i >= 1; i--) {
          c[i] = b[i] + r * c[i + 1] + s * c[i + 2];
        }

        // Sistema de ecuaciones para Δr y Δs:
        // c2 * Δr + c3 * Δs = -b1
        // c1 * Δr + c2 * Δs = -b0
        const c1 = c[1];
        const c2 = c[2];
        const c3 = n >= 3 ? c[3] : 0;
        const b0 = b[0];
        const b1 = b[1];

        const det = c2 * c2 - c1 * c3;
        if (Math.abs(det) < 1e-14) {
          // Pequeña perturbación si el determinante es nulo para evitar atascos
          r += 0.1;
          s -= 0.1;
          continue;
        }

        const deltaR = (-b1 * c2 + b0 * c3) / det;
        const deltaS = (-b0 * c2 + b1 * c1) / det;

        const errR = Math.abs(r) > 1e-10 ? Math.abs(deltaR / r) * 100 : Math.abs(deltaR) * 100;
        const errS = Math.abs(s) > 1e-10 ? Math.abs(deltaS / s) * 100 : Math.abs(deltaS) * 100;

        stageIterations.push({
          iteration: iter,
          r,
          s,
          deltaR,
          deltaS,
          errR,
          errS,
          b0,
          b1
        });

        r += deltaR;
        s += deltaS;

        if (errR < tol * 100 && errS < tol * 100) {
          factorConverged = true;
          break;
        }
      }

      // Extraer raíces del factor x^2 - r*x - s = 0
      const disc = r * r + 4 * s;
      let root1, root2;
      if (disc >= 0) {
        root1 = { real: (r + Math.sqrt(disc)) / 2, imag: 0, text: ((r + Math.sqrt(disc)) / 2).toFixed(6) };
        root2 = { real: (r - Math.sqrt(disc)) / 2, imag: 0, text: ((r - Math.sqrt(disc)) / 2).toFixed(6) };
      } else {
        const realPart = r / 2;
        const imagPart = Math.sqrt(-disc) / 2;
        root1 = {
          real: realPart,
          imag: imagPart,
          text: `${realPart.toFixed(6)} + ${imagPart.toFixed(6)}i`
        };
        root2 = {
          real: realPart,
          imag: -imagPart,
          text: `${realPart.toFixed(6)} - ${imagPart.toFixed(6)}i`
        };
      }

      roots.push(root1, root2);
      quadraticFactors.push({ r, s, factor: `x² - (${r.toFixed(4)})x - (${s.toFixed(4)})` });

      const currentStage = {
        stage: stageNumber++,
        polynomialDegree: n,
        polynomialCoefficients: [...a].reverse(), // orden descendente para presentación
        converged: factorConverged,
        iterations: stageIterations,
        rFinal: r,
        sFinal: s,
        extractedRoots: [root1, root2]
      };
      stages.push(currentStage);

      // Deflación del polinomio con los coeficientes b
      // Los nuevos coeficientes son b_n, b_{n-1}, ..., b_2
      const newA = [];
      // Array b recalculado con el r, s final convergido
      const finalB = new Array(n + 1).fill(0);
      finalB[n] = a[n];
      finalB[n - 1] = a[n - 1] + r * finalB[n];
      for (let i = n - 2; i >= 0; i--) {
        finalB[i] = a[i] + r * finalB[i + 1] + s * finalB[i + 2];
      }

      // El cociente conserva el orden ascendente: b[i] es el coeficiente de x^(i-2)
      for (let i = 2; i <= n; i++) {
        newA.push(finalB[i]);
      }
      a = newA; // Nuevo polinomio deflactado
      n = a.length - 1;
      currentStage.deflatedPolynomial = [...a].reverse(); // orden descendente
    }

    // Resolver grado restante
    if (n === 2) {
      const a2 = a[2];
      const a1 = a[1];
      const a0 = a[0];
      const disc = a1 * a1 - 4 * a2 * a0;
      let root1, root2;
      if (disc >= 0) {
        root1 = { real: (-a1 + Math.sqrt(disc)) / (2 * a2), imag: 0, text: ((-a1 + Math.sqrt(disc)) / (2 * a2)).toFixed(6) };
        root2 = { real: (-a1 - Math.sqrt(disc)) / (2 * a2), imag: 0, text: ((-a1 - Math.sqrt(disc)) / (2 * a2)).toFixed(6) };
      } else {
        const realPart = -a1 / (2 * a2);
        const imagPart = Math.sqrt(-disc) / (2 * a2);
        root1 = { real: realPart, imag: imagPart, text: `${realPart.toFixed(6)} + ${imagPart.toFixed(6)}i` };
        root2 = { real: realPart, imag: -imagPart, text: `${realPart.toFixed(6)} - ${imagPart.toFixed(6)}i` };
      }
      roots.push(root1, root2);
      stages.push({
        stage: stageNumber++,
        polynomialDegree: 2,
        polynomialCoefficients: [...a].reverse(),
        converged: true,
        iterations: [],
        note: 'Resuelto directamente por fórmula cuadrática',
        extractedRoots: [root1, root2]
      });
    } else if (n === 1) {
      const a1 = a[1];
      const a0 = a[0];
      const rootVal = -a0 / a1;
      const root = { real: rootVal, imag: 0, text: rootVal.toFixed(6) };
      roots.push(root);
      stages.push({
        stage: stageNumber++,
        polynomialDegree: 1,
        polynomialCoefficients: [...a].reverse(),
        converged: true,
        iterations: [],
        note: 'Resuelto directamente como raíz lineal simple (-a0 / a1)',
        extractedRoots: [root]
      });
    }

    return {
      success: true,
      roots,
      stages,
      quadraticFactors,
      totalIterations: stages.reduce((acc, stage) => acc + stage.iterations.length, 0),
      finalError: null,
      message: `Se extrajeron ${roots.length} raíces del polinomio de grado ${workingDegree} en ${stages.length} etapa(s) de deflación.`,
      originalDegree: workingDegree
    };
  } catch (err) {
    return {
      success: false,
      roots: [],
      stages: [],
      error: err.message,
      message: `Error al ejecutar el método de Bairstow: ${err.message}`
    };
  }
}
