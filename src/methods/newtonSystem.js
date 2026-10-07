import { compile, derivative, det, lusolve } from 'mathjs';

/**
 * Método de Newton-Raphson para Sistemas de Ecuaciones No Lineales
 * F(X) = 0 mediante J(X) * ΔX = -F(X) => X_(k+1) = X_k + ΔX
 * 
 * @param {Array<string>} equations - Lista de expresiones igualadas a 0, ej: ["x^2 + y^2 - 4", "exp(x) + y - 1"]
 * @param {Array<string>} variables - Nombres de variables, ej: ["x", "y"]
 * @param {Array<number>} initialValues - Vector inicial x0, ej: [1.5, 0.5]
 * @param {number} tol - Tolerancia de error (ej: 1e-6)
 * @param {number} maxIter - Iteraciones máximas
 * @returns {object} Resultados detallados con tablas de iteración, Jacobiano y diagnósticos
 */
export function solveNewtonSystem(equations, variables, initialValues, tol = 1e-6, maxIter = 50) {
  try {
    const n = variables.length;
    if (equations.length !== n) {
      throw new Error(`El número de ecuaciones (${equations.length}) debe ser igual al número de variables (${n}).`);
    }

    // Compilar ecuaciones
    const compiledEqs = equations.map((eq) => compile(eq));

    // Intentar calcular derivadas simbólicas; si falla alguna, usar diferencias finitas
    const symbolicJacobian = [];
    let canUseSymbolic = true;

    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        try {
          const d = derivative(equations[i], variables[j]);
          row.push(d.compile());
        } catch {
          canUseSymbolic = false;
          break;
        }
      }
      if (!canUseSymbolic) break;
      symbolicJacobian.push(row);
    }

    // Función para evaluar F(X)
    const evalF = (vectorX) => {
      const scope = {};
      variables.forEach((v, idx) => {
        scope[v] = vectorX[idx];
      });
      return compiledEqs.map((compiled) => {
        const val = compiled.evaluate(scope);
        if (typeof val !== 'number' || !Number.isFinite(val)) {
          throw new Error(`Evaluación no numérica en ecuación para valores: ${JSON.stringify(scope)}`);
        }
        return val;
      });
    };

    // Función para evaluar J(X)
    const evalJ = (vectorX) => {
      const scope = {};
      variables.forEach((v, idx) => {
        scope[v] = vectorX[idx];
      });

      if (canUseSymbolic && symbolicJacobian.length === n) {
        return symbolicJacobian.map((row) => row.map((cell) => cell.evaluate(scope)));
      }

      // Diferencias finitas centradas
      const h = 1e-6;
      const J = [];
      for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
          const vectorPlus = [...vectorX];
          const vectorMinus = [...vectorX];
          vectorPlus[j] += h;
          vectorMinus[j] -= h;

          const scopePlus = {};
          const scopeMinus = {};
          variables.forEach((v, idx) => {
            scopePlus[v] = vectorPlus[idx];
            scopeMinus[v] = vectorMinus[idx];
          });

          const fPlus = compiledEqs[i].evaluate(scopePlus);
          const fMinus = compiledEqs[i].evaluate(scopeMinus);
          row.push((fPlus - fMinus) / (2 * h));
        }
        J.push(row);
      }
      return J;
    };

    let currentX = [...initialValues.map(Number)];
    const iterations = [];
    let converged = false;
    let message = '';

    for (let k = 1; k <= maxIter; k++) {
      const F = evalF(currentX);
      const J = evalJ(currentX);

      // Calcular determinante
      let detJ = 0;
      try {
        detJ = det(J);
      } catch {
        detJ = NaN;
      }

      if (Math.abs(detJ) < 1e-12 || isNaN(detJ)) {
        message = `Jacobiano singular o casi singular (|det(J)| < 1e-12) en iteración ${k}. El método no puede continuar sin invertir J.`;
        break;
      }

      // Resolver J * deltaX = -F
      const minusF = F.map((val) => -val);
      let deltaX;
      try {
        // lusolve retorna una matriz columna [[dx1], [dx2], ...]
        const sol = lusolve(J, minusF);
        deltaX = sol.map((item) => (Array.isArray(item) ? item[0] : item));
      } catch (err) {
        message = `Error al resolver sistema lineal del Jacobiano: ${err.message}`;
        break;
      }

      const nextX = currentX.map((val, idx) => val + deltaX[idx]);

      // Error euclidiano y norma infinita
      const normDelta = Math.sqrt(deltaX.reduce((acc, val) => acc + val * val, 0));
      const normX = Math.sqrt(nextX.reduce((acc, val) => acc + val * val, 0));
      const relativeError = normX > 1e-12 ? (normDelta / normX) * 100 : normDelta * 100;

      iterations.push({
        iteration: k,
        xCurrent: [...currentX],
        F: [...F],
        J: J.map((r) => [...r]),
        detJ,
        deltaX: [...deltaX],
        xNext: [...nextX],
        normDelta,
        relativeError
      });

      if (normDelta < tol) {
        converged = true;
        currentX = nextX;
        message = `Convergencia alcanzada en la iteración ${k} con norma de corrección ${normDelta.toExponential(4)}.`;
        break;
      }

      currentX = nextX;
    }

    if (!converged && !message) {
      message = `Se alcanzó el número máximo de iteraciones (${maxIter}) sin satisfacer la tolerancia requerida.`;
    }

    return {
      success: converged,
      solution: currentX,
      variables,
      iterations,
      totalIterations: iterations.length,
      finalError: iterations.length > 0 ? iterations[iterations.length - 1].normDelta : null,
      message
    };
  } catch (err) {
    return {
      success: false,
      solution: null,
      variables,
      iterations: [],
      error: err.message,
      message: `Error general en el cálculo de Newton para sistemas: ${err.message}`
    };
  }
}
