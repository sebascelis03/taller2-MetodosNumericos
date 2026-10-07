import { useMemo, useState } from 'react';
import {
  Activity,
  CircleAlert,
  CircleCheckBig,
  FileDown,
  Play,
  Repeat,
  RotateCcw,
  Sparkles,
  Table,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { compile, derivative } from 'mathjs';
import { solveSequentialIteration } from '../methods/sequentialIteration.js';
import { downloadCSV, fmt, fmtPercent } from '../utils/format.js';
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  PresetChip,
  PrimaryButton,
  SecondaryButton,
  SegmentedControl,
  StatCard,
  TableShell,
  Td,
  Th,
  TextInput,
} from './UiKit.jsx';

/** Casos de prueba verificados numéricamente. */
const PRESETS = [
  {
    title: 'x = e⁻ˣ  (raíz ≈ 0.567143)',
    gExpr: 'exp(-x)',
    x0: '0.5',
    detail: 'g(x) = exp(-x)',
    tone: 'slate',
  },
  {
    title: 'Raíz de 2 por promedio babilónico',
    gExpr: '(x + 2/x)/2',
    x0: '1',
    detail: 'g(x) = (x + 2/x)/2',
    tone: 'slate',
  },
  {
    title: 'x = cos(x)  (punto de Dottie)',
    gExpr: 'cos(x)',
    x0: '0.5',
    detail: 'g(x) = cos(x)',
    tone: 'slate',
  },
  {
    title: 'x³ + 2x² − 20x + 10 = 0',
    gExpr: '(x^3 + 2*x^2 + 10) / 20',
    x0: '1',
    detail: 'g(x) = (x³ + 2x² + 10)/20',
    tone: 'slate',
  },
  {
    title: 'x³ + x² − 10 = 0  (reformulado, converge)',
    gExpr: 'cbrt(10 - x^2)',
    x0: '1.5',
    detail: 'g(x) = ∛(10 − x²)',
    tone: 'cyan',
  },
  {
    title: 'x = √(10 − x³)  (DIVERGE: |g′| > 1)',
    gExpr: 'sqrt(10 - x^3)',
    x0: '1.5',
    detail: 'g(x) = √(10 − x³)',
    tone: 'amber',
  },
];

/**
 * Analiza la condición suficiente de convergencia |g'(x₀)| < 1.
 * Intenta derivación simbólica con mathjs y recurre a diferencias finitas centradas.
 * @param {string} gExpr
 * @param {string} x0Raw
 * @returns {object} diagnóstico
 */
function analyzeConvergence(gExpr, x0Raw) {
  const expression = gExpr.trim();
  if (!expression) return { state: 'empty' };

  const x0 = Number(x0Raw);
  if (!Number.isFinite(x0)) return { state: 'invalid-x0' };

  // 1. Validar que la expresión sea evaluable en x₀
  let compiled;
  let gValue;
  try {
    compiled = compile(expression);
    gValue = compiled.evaluate({ x: x0 });
    if (typeof gValue !== 'number' || !Number.isFinite(gValue)) {
      return { state: 'not-evaluable', reason: `g(${x0}) no produce un número real finito.` };
    }
  } catch (err) {
    return { state: 'invalid-expression', reason: err.message };
  }

  // 2. Derivada simbólica (preferida) con respaldo numérico
  let derivativeExpr = null;
  let derivativeValue = null;
  try {
    const symbolic = derivative(expression, 'x');
    derivativeExpr = symbolic.toString();
    const value = symbolic.evaluate({ x: x0 });
    if (typeof value === 'number' && Number.isFinite(value)) derivativeValue = value;
  } catch {
    derivativeExpr = null;
  }

  if (derivativeValue === null) {
    try {
      const h = 1e-6;
      const forward = compiled.evaluate({ x: x0 + h });
      const backward = compiled.evaluate({ x: x0 - h });
      const value = (forward - backward) / (2 * h);
      if (Number.isFinite(value)) derivativeValue = value;
    } catch {
      derivativeValue = null;
    }
  }

  if (derivativeValue === null) {
    return { state: 'unknown-derivative', gValue };
  }

  return {
    state: Math.abs(derivativeValue) < 1 ? 'converges' : 'diverges',
    derivativeExpr,
    derivativeValue,
    gValue,
  };
}

export default function SequentialCalculator() {
  const [gExpr, setGExpr] = useState('exp(-x)');
  const [x0, setX0] = useState('0.5');
  const [tol, setTol] = useState('0.000001');
  const [maxIter, setMaxIter] = useState('100');
  const [errorType, setErrorType] = useState('relative');
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');

  const diagnosis = useMemo(() => analyzeConvergence(gExpr, x0), [gExpr, x0]);

  const applyPreset = (preset) => {
    setGExpr(preset.gExpr);
    setX0(preset.x0);
    setResult(null);
    setFormError('');
  };

  const reset = () => {
    setGExpr('');
    setX0('');
    setTol('0.000001');
    setMaxIter('100');
    setErrorType('relative');
    setResult(null);
    setFormError('');
  };

  const handleSolve = (event) => {
    event.preventDefault();

    // Validación de entradas antes de invocar la capa matemática
    if (!gExpr.trim()) return setFormError('Ingresa la función g(x).');
    if (!Number.isFinite(Number(x0))) return setFormError('El valor inicial x₀ debe ser un número válido.');

    const tolerance = Number(tol);
    if (!Number.isFinite(tolerance) || tolerance <= 0) return setFormError('La tolerancia debe ser un número positivo.');

    const iterations = Number.parseInt(maxIter, 10);
    if (!Number.isInteger(iterations) || iterations < 1 || iterations > 10000) {
      return setFormError('El número máximo de iteraciones debe ser un entero entre 1 y 10000.');
    }
    if (diagnosis.state === 'invalid-expression') {
      return setFormError(`Sintaxis inválida en g(x): ${diagnosis.reason}`);
    }

    setFormError('');
    setResult(solveSequentialIteration(gExpr.trim(), Number(x0), tolerance, iterations, errorType));
  };

  const exportCSV = () => {
    if (!result?.iterations?.length) return;
    downloadCSV(
      'iterativo-secuencial',
      ['k', 'x_k', 'x_k+1', 'Error absoluto', 'Error relativo (%)'],
      result.iterations.map((row) => [
        row.iteration,
        row.xPrev.toFixed(10),
        row.xNext.toFixed(10),
        row.errorAbs.toExponential(6),
        row.errorRel.toExponential(6),
      ]),
    );
  };

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* ----------------------------------------------- Panel de entrada */}
      <div className="min-w-0 space-y-5 lg:col-span-2">
        <Card>
          <CardHeader
            icon={Repeat}
            accent="indigo"
            title="Parámetros de iteración"
            subtitle="Transforma f(x) = 0 en x = g(x) e itera xₖ₊₁ = g(xₖ)"
          />
          <CardBody>
            <form onSubmit={handleSolve} className="space-y-4">
              <Field label="Función g(x)" hint="sintaxis mathjs" htmlFor="seq-g">
                <TextInput
                  id="seq-g"
                  value={gExpr}
                  onChange={(e) => setGExpr(e.target.value)}
                  placeholder="exp(-x)"
                  invalid={diagnosis.state === 'invalid-expression'}
                  autoComplete="off"
                  spellCheck={false}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor inicial x₀" htmlFor="seq-x0">
                  <TextInput
                    id="seq-x0"
                    value={x0}
                    onChange={(e) => setX0(e.target.value)}
                    placeholder="0.5"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Máx. iteraciones" htmlFor="seq-max">
                  <TextInput
                    id="seq-max"
                    value={maxIter}
                    onChange={(e) => setMaxIter(e.target.value)}
                    placeholder="100"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <Field label="Tolerancia" hint={errorType === 'relative' ? 'equivale a % · 100' : 'unidades de x'} htmlFor="seq-tol">
                <TextInput
                  id="seq-tol"
                  value={tol}
                  onChange={(e) => setTol(e.target.value)}
                  placeholder="0.000001"
                  inputMode="decimal"
                />
              </Field>

              <Field label="Tipo de error">
                <SegmentedControl
                  value={errorType}
                  onChange={setErrorType}
                  options={[
                    { value: 'relative', label: 'Relativo (%)' },
                    { value: 'absolute', label: 'Absoluto' },
                  ]}
                />
              </Field>

              <div className="flex gap-2 pt-1">
                <PrimaryButton type="submit" icon={Play}>
                  Calcular raíz
                </PrimaryButton>
                <SecondaryButton type="button" icon={RotateCcw} onClick={reset} className="shrink-0">
                  Limpiar
                </SecondaryButton>
              </div>

              {formError ? (
                <Alert tone="danger" icon={CircleAlert} title="Entrada inválida">
                  {formError}
                </Alert>
              ) : null}
            </form>
          </CardBody>
        </Card>

        {/* Banner de diagnóstico de convergencia */}
        <ConvergenceBanner diagnosis={diagnosis} x0={x0} />

        <Card>
          <CardHeader
            icon={Sparkles}
            accent="cyan"
            title="Ejemplos predefinidos"
            subtitle="Cárgalos con un clic para comparar casos convergentes y divergentes"
          />
          <CardBody className="space-y-2">
            {PRESETS.map((preset) => (
              <PresetChip
                key={preset.gExpr}
                title={preset.title}
                detail={`${preset.detail}   ·   x₀ = ${preset.x0}`}
                tone={preset.tone}
                onClick={() => applyPreset(preset)}
              />
            ))}
          </CardBody>
        </Card>
      </div>

      {/* ----------------------------------------------- Panel de resultados */}
      <div className="min-w-0 space-y-5 lg:col-span-3">
        {!result ? (
          <Card>
            <CardBody>
              <EmptyState icon={Target} title="Sin cálculos todavía">
                Define g(x) y el valor inicial x₀, luego presiona <strong className="text-slate-300">Calcular raíz</strong>{' '}
                para ver el resumen y la tabla completa de iteraciones.
              </EmptyState>
            </CardBody>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader
                icon={result.success ? CircleCheckBig : TriangleAlert}
                accent={result.success ? 'emerald' : 'amber'}
                title={result.success ? 'Convergencia alcanzada' : 'El método no convergió'}
                subtitle={result.message}
              />
              <CardBody>
                {result.error ? (
                  <Alert tone="danger" icon={CircleAlert} title="Error de evaluación">
                    {result.error}
                  </Alert>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard
                      label="Raíz aproximada"
                      value={fmt(result.root)}
                      hint="x ≈ g(x)"
                      tone={result.success ? 'emerald' : 'amber'}
                      icon={Target}
                    />
                    <StatCard
                      label="Iteraciones"
                      value={result.totalIterations}
                      hint={`máximo permitido: ${maxIter}`}
                      tone="indigo"
                      icon={Repeat}
                    />
                    <StatCard
                      label={errorType === 'relative' ? 'Error relativo final' : 'Error absoluto final'}
                      value={
                        errorType === 'relative'
                          ? fmtPercent(result.finalError)
                          : fmt(result.finalError === null ? null : result.finalError, 10)
                      }
                      hint={`tolerancia: ${tol}`}
                      tone="cyan"
                      icon={Activity}
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            {result.iterations.length > 0 ? (
              <Card>
                <CardHeader
                  icon={Table}
                  accent="slate"
                  title={`Tabla de iteraciones (${result.iterations.length})`}
                  subtitle="Cada fila muestra el avance del punto fijo y la reducción del error"
                  action={
                    <SecondaryButton type="button" icon={FileDown} onClick={exportCSV}>
                      Exportar CSV
                    </SecondaryButton>
                  }
                />
                <CardBody>
                  <TableShell className="max-h-[32rem] overflow-y-auto">
                    <thead>
                      <tr>
                        <Th align="center">k</Th>
                        <Th>xₖ</Th>
                        <Th>xₖ₊₁ = g(xₖ)</Th>
                        <Th>Eₐ = |xₖ₊₁ − xₖ|</Th>
                        <Th>Eᵣ (%)</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.iterations.map((row, index) => {
                        const isLast = index === result.iterations.length - 1;
                        return (
                          <tr
                            key={row.iteration}
                            className={`border-b border-slate-800/60 transition last:border-0 ${
                              isLast && result.success ? 'bg-emerald-500/5' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <Td align="center" className="text-slate-500">
                              {row.iteration}
                            </Td>
                            <Td>{fmt(row.xPrev)}</Td>
                            <Td className={isLast && result.success ? 'font-semibold text-emerald-300' : 'text-slate-100'}>
                              {fmt(row.xNext)}
                            </Td>
                            <Td className="text-slate-400">{row.errorAbs.toExponential(4)}</Td>
                            <Td className="text-slate-400">{row.errorRel.toExponential(4)}</Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </TableShell>
                </CardBody>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Banner que informa si se satisface la condición suficiente de convergencia.
 */
function ConvergenceBanner({ diagnosis, x0 }) {
  if (diagnosis.state === 'empty') {
    return (
      <Alert tone="neutral" icon={Activity} title="Criterio de convergencia">
        Ingresa g(x) y x₀ para evaluar automáticamente |g′(x₀)| &lt; 1.
      </Alert>
    );
  }

  if (diagnosis.state === 'invalid-expression') {
    return (
      <Alert tone="danger" icon={CircleAlert} title="Expresión no válida">
        {diagnosis.reason}
      </Alert>
    );
  }

  if (diagnosis.state === 'invalid-x0') {
    return (
      <Alert tone="warning" icon={TriangleAlert} title="Valor inicial pendiente">
        Escribe un x₀ numérico para evaluar la derivada.
      </Alert>
    );
  }

  if (diagnosis.state === 'not-evaluable') {
    return (
      <Alert tone="danger" icon={CircleAlert} title="g(x) no es evaluable en x₀">
        {diagnosis.reason} Prueba otro valor inicial dentro del dominio de g.
      </Alert>
    );
  }

  if (diagnosis.state === 'unknown-derivative') {
    return (
      <Alert tone="warning" icon={TriangleAlert} title="No fue posible estimar g′(x₀)">
        La función es evaluable pero su derivada no pudo calcularse ni simbólica ni numéricamente en x₀.
      </Alert>
    );
  }

  const converges = diagnosis.state === 'converges';
  const absValue = Math.abs(diagnosis.derivativeValue);

  return (
    <Alert
      tone={converges ? 'success' : 'warning'}
      icon={converges ? CircleCheckBig : TriangleAlert}
      title={
        converges
          ? 'Condición suficiente de convergencia satisfecha'
          : 'Advertencia: la condición suficiente NO se cumple'
      }
    >
      <div className="space-y-1.5">
        <p className="font-mono text-[11px] text-slate-200">
          |g′({x0})| = {fmt(absValue)} {converges ? '< 1' : '≥ 1'}
        </p>
        {diagnosis.derivativeExpr ? (
          <p className="font-mono text-[11px] break-all text-slate-400">g′(x) = {diagnosis.derivativeExpr}</p>
        ) : (
          <p className="text-[11px] text-slate-400">Derivada estimada por diferencias finitas centradas (h = 1×10⁻⁶).</p>
        )}
        <p className="text-[11px] text-slate-400">
          {converges
            ? 'El punto fijo es atractor cerca de x₀: la sucesión xₖ₊₁ = g(xₖ) debería converger.'
            : 'El punto fijo es repulsor cerca de x₀: la sucesión puede diverger u oscilar. Reformula g(x) o elige otro x₀.'}
        </p>
      </div>
    </Alert>
  );
}
