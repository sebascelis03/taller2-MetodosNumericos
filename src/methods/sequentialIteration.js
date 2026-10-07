import { compile } from 'mathjs';

/**
 * Método Iterativo Secuencial (Punto Fijo: x = g(x))
 * @param {string} gExpr - Expresión de g(x), e.g. "sqrt(10 - x^3)" o "(x + 2/x)/2"
 * @param {number} x0 - Valor inicial
 * @param {number} tol - Tolerancia de error (ej: 0.0001)
 * @param {number} maxIter - Número máximo de iteraciones
 * @param {'absolute'|'relative'} errorType - Criterio de error
 * @returns {object} Resultado con historial de iteraciones y diagnósticos
 */
export function solveSequentialIteration(gExpr, x0, tol = 1e-5, maxIter = 100, errorType = 'relative') {
  try {
    const compiledG = compile(gExpr);
    
    // Función de evaluación segura
    const evalG = (val) => {
      const res = compiledG.evaluate({ x: val });
      if (typeof res !== 'number' || !Number.isFinite(res)) {
        throw new Error(`g(${val}) arrojó un valor no numérico o indeterminado: ${res}`);
      }
      return res;
    };

    // Estimar g'(x0) numéricamente para evaluar el criterio de convergencia |g'(x)| < 1
    const h = 1e-6;
    let derivativeAtX0 = null;
    let satisfiesConvergenceCriterion = null;
    try {
      const gPlus = compiledG.evaluate({ x: x0 + h });
      const gMinus = compiledG.evaluate({ x: x0 - h });
      derivativeAtX0 = (gPlus - gMinus) / (2 * h);
      satisfiesConvergenceCriterion = Math.abs(derivativeAtX0) < 1;
    } catch {
      // Ignorar si no se puede evaluar la derivada en x0
    }

    const iterations = [];
    let currentX = Number(x0);
    let converged = false;
    let exitReason = '';

    for (let k = 1; k <= maxIter; k++) {
      const nextX = evalG(currentX);

      const ea = Math.abs(nextX - currentX);
      const er = Math.abs(nextX) > 1e-12 ? (ea / Math.abs(nextX)) * 100 : ea * 100;
      const currentError = errorType === 'relative' ? er : ea;

      iterations.push({
        iteration: k,
        xPrev: currentX,
        xNext: nextX,
        errorAbs: ea,
        errorRel: er,
        gVal: nextX
      });

      if (!Number.isFinite(nextX) || isNaN(nextX) || Math.abs(nextX) > 1e12) {
        exitReason = 'Divergencia detectada: los valores de x crecen sin límite.';
        break;
      }

      const threshold = errorType === 'relative' ? tol * 100 : tol;
      if (currentError <= threshold) {
        converged = true;
        currentX = nextX;
        exitReason = `Convergencia alcanzada en la iteración ${k} con error ${currentError.toExponential(4)}.`;
        break;
      }

      currentX = nextX;
    }

    if (!converged && !exitReason) {
      exitReason = `Se alcanzó el número máximo de iteraciones (${maxIter}) sin satisfacer la tolerancia requerida.`;
    }

    return {
      success: converged,
      root: currentX,
      iterations,
      totalIterations: iterations.length,
      derivativeAtX0,
      satisfiesConvergenceCriterion,
      finalError: iterations.length > 0 ? (errorType === 'relative' ? iterations[iterations.length - 1].errorRel : iterations[iterations.length - 1].errorAbs) : null,
      message: exitReason
    };
  } catch (err) {
    return {
      success: false,
      root: null,
      iterations: [],
      error: err.message,
      message: `Error al procesar la función: ${err.message}`
    };
  }
}
