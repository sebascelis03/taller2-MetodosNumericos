/**
 * Utilidades puras de formato numérico, construcción de polinomios y exportación CSV.
 * No dependen de React ni del DOM (salvo `downloadCSV`, que usa la API de Blob del navegador).
 */

/**
 * Formatea un número para tablas y tarjetas.
 * Usa notación científica cuando el valor es muy pequeño (< 1e-4) o muy grande (>= 1e8).
 * @param {number|null|undefined} value
 * @param {number} digits - Decimales en notación fija
 * @returns {string}
 */
export function fmt(value, digits = 6) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return 'NaN';
  if (!Number.isFinite(num)) return num > 0 ? '∞' : '-∞';
  if (num === 0) return (0).toFixed(digits);

  const abs = Math.abs(num);
  if (abs < 1e-4 || abs >= 1e8) return num.toExponential(4);
  return num.toFixed(digits);
}

/**
 * Formatea un error como porcentaje legible.
 * @param {number|null} value
 * @returns {string}
 */
export function fmtPercent(value) {
  if (value === null || value === undefined) return '—';
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  if (num !== 0 && Math.abs(num) < 1e-4) return `${num.toExponential(4)} %`;
  return `${num.toFixed(6)} %`;
}

/** Dígitos en superíndice para exponentes de polinomios. */
const SUPERSCRIPTS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

/**
 * Convierte un entero no negativo a superíndice unicode (ej: 12 -> "¹²").
 * @param {number} n
 * @returns {string}
 */
export function superscript(n) {
  return String(n)
    .split('')
    .map((d) => SUPERSCRIPTS[Number(d)] ?? d)
    .join('');
}

/**
 * Redondea el ruido de punto flotante acumulado durante la deflación polinómica,
 * de modo que 2.5000000000000004 se muestre como 2.5.
 * @param {number} value
 * @returns {string}
 */
function cleanCoefficient(value) {
  const rounded = Number(value.toPrecision(10));
  return Number.isInteger(rounded) ? String(rounded) : String(Number(rounded.toFixed(8)));
}

/**
 * Construye la representación legible de un polinomio.
 * @param {Array<number>} coefficients - De MAYOR a MENOR grado
 * @returns {string} ej: "x³ - 2x² - 5x + 6"
 */
export function polynomialToString(coefficients) {
  const coefs = coefficients.map(Number);
  const degree = coefs.length - 1;
  let out = '';

  coefs.forEach((coef, index) => {
    // Los términos residuales de la deflación (|a| < 1e-10) se consideran nulos
    if (!Number.isFinite(coef) || Math.abs(coef) < 1e-10) return;

    const power = degree - index;
    const abs = Math.abs(coef);
    const sign = coef < 0 ? '−' : '+';
    const magnitude = cleanCoefficient(abs);
    const showMagnitude = magnitude !== '1' || power === 0;

    const variable = power === 0 ? '' : power === 1 ? 'x' : `x${superscript(power)}`;
    const term = `${showMagnitude ? magnitude : ''}${variable}`;

    if (out === '') {
      out = coef < 0 ? `−${term}` : term;
    } else {
      out += ` ${sign} ${term}`;
    }
  });

  return out === '' ? '0' : out;
}

/**
 * Formatea un vector numérico como tupla compacta: "(1.414214, 1.414214)"
 * @param {Array<number>} vector
 * @param {number} digits
 * @returns {string}
 */
export function vectorToString(vector, digits = 6) {
  if (!Array.isArray(vector)) return '—';
  return `(${vector.map((v) => fmt(v, digits)).join(', ')})`;
}

/**
 * Escapa un valor para una celda CSV.
 * @param {unknown} value
 * @returns {string}
 */
function escapeCSVCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Genera y descarga un archivo CSV en el navegador.
 * Se usa punto y coma como separador para compatibilidad con Excel en configuración regional es-CO.
 * @param {string} filename - Nombre sugerido (sin extensión)
 * @param {Array<string>} headers - Encabezados de columna
 * @param {Array<Array<unknown>>} rows - Filas de datos
 */
export function downloadCSV(filename, headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCSVCell).join(';'));
  // BOM para que Excel reconozca UTF-8 (tildes y símbolos matemáticos)
  const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
