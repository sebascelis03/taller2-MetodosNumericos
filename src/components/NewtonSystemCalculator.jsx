import { useMemo, useState } from 'react';
import {
  Activity,
  CircleAlert,
  CircleCheckBig,
  FileDown,
  Grid3x3,
  Play,
  RotateCcw,
  Sparkles,
  Table,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { derivative, parse } from 'mathjs';
import { solveNewtonSystem } from '../methods/newtonSystem.js';
import { downloadCSV, fmt, fmtPercent } from '../utils/format.js';
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  MatrixDisplay,
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

const VARIABLES = { 2: ['x', 'y'], 3: ['x', 'y', 'z'] };

/** Sistemas de ejemplo verificados numéricamente. */
const PRESETS = {
  2: [
    {
      title: 'Círculo ∩ Recta  →  (1.414214, 1.414214)',
      equations: ['x^2 + y^2 - 4', 'x - y'],
      initials: ['1.5', '0.5'],
    },
    {
      title: 'Sistema cuadrático clásico  →  (2, 3)',
      equations: ['x^2 + x*y - 10', 'y + 3*x*y^2 - 57'],
      initials: ['1.5', '3.5'],
    },
    {
      title: 'Parábola ∩ Elipse  →  (1.900677, 0.311219)',
      equations: ['x^2 - 2*x - y + 0.5', 'x^2 + 4*y^2 - 4'],
      initials: ['2', '0.25'],
    },
    {
      title: 'Exponencial ∩ Círculo  →  (−1.816264, 0.837368)',
      equations: ['exp(x) + y - 1', 'x^2 + y^2 - 4'],
      initials: ['-1.5', '1'],
    },
  ],
  3: [
    {
      title: 'Esfera ∩ Producto ∩ Paraboloide  →  (2.491376, 0.242746, 1.653518)',
      equations: ['x^2 + y^2 + z^2 - 9', 'x*y*z - 1', 'x + y - z^2'],
      initials: ['2.5', '0.2', '1.6'],
    },
    {
      title: 'Sistema trascendental  →  (0.5, 0, −0.523599)',
      equations: ['3*x - cos(y*z) - 0.5', 'x^2 - 81*(y + 0.1)^2 + sin(z) + 1.06', 'exp(-x*y) + 20*z + (10*pi - 3)/3'],
      initials: ['0.1', '0.1', '-0.1'],
    },
    {
      title: 'Suma · Norma · Cúbico  →  (1.490128, 1.357705, 3.152167)',
      equations: ['x + y + z - 6', 'x^2 + y^2 + z^2 - 14', 'x^3 + y^2 - z - 2'],
      initials: ['1.5', '1.5', '3'],
    },
  ],
};

/**
 * Calcula el Jacobiano simbólico ∂fᵢ/∂xⱼ para mostrarlo en pantalla.
 * @param {Array<string>} equations
 * @param {Array<string>} variables
 * @returns {{ok: boolean, matrix?: Array<Array<string>>, error?: string}}
 */
function symbolicJacobian(equations, variables) {
  try {
    const matrix = equations.map((equation) => {
      if (!equation.trim()) throw new Error('Hay ecuaciones vacías.');
      return variables.map((variable) => derivative(equation, variable).toString());
    });
    return { ok: true, matrix };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export default function NewtonSystemCalculator() {
  const [size, setSize] = useState(2);
  const [equations, setEquations] = useState(['x^2 + y^2 - 4', 'x - y', '']);
  const [initials, setInitials] = useState(['1.5', '0.5', '1']);
  const [tol, setTol] = useState('0.0000001');
  const [maxIter, setMaxIter] = useState('50');
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');
  const [selectedIteration, setSelectedIteration] = useState(0);

  const variables = VARIABLES[size];
  const activeEquations = equations.slice(0, size);
  const activeInitials = initials.slice(0, size);

  // Depende de `equations` y `size` (no de los arreglos derivados) para no recalcular en cada render
  const jacobian = useMemo(() => symbolicJacobian(equations.slice(0, size), VARIABLES[size]), [equations, size]);

  const updateEquation = (index, value) => {
    setEquations((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const updateInitial = (index, value) => {
    setInitials((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const changeSize = (next) => {
    setSize(next);
    setResult(null);
    setFormError('');
  };

  const applyPreset = (preset) => {
    setEquations((prev) => preset.equations.concat(prev.slice(preset.equations.length)));
    setInitials((prev) => preset.initials.concat(prev.slice(preset.initials.length)));
    setResult(null);
    setFormError('');
  };

  const reset = () => {
    setEquations(['', '', '']);
    setInitials(['0', '0', '0']);
    setTol('0.0000001');
    setMaxIter('50');
    setResult(null);
    setFormError('');
  };

  const handleSolve = (event) => {
    event.preventDefault();

    if (activeEquations.some((equation) => !equation.trim())) {
      return setFormError(`Completa las ${size} ecuaciones del sistema.`);
    }
    if (activeInitials.some((value) => !Number.isFinite(Number(value)) || value === '')) {
      return setFormError('Todos los valores iniciales deben ser números válidos.');
    }

    const tolerance = Number(tol);
    if (!Number.isFinite(tolerance) || tolerance <= 0) return setFormError('La tolerancia debe ser un número positivo.');

    const iterations = Number.parseInt(maxIter, 10);
    if (!Number.isInteger(iterations) || iterations < 1 || iterations > 1000) {
      return setFormError('El número máximo de iteraciones debe ser un entero entre 1 y 1000.');
    }

    // Validar sintaxis de cada ecuación antes de invocar la capa matemática
    for (let i = 0; i < size; i++) {
      try {
        parse(activeEquations[i]);
      } catch (err) {
        return setFormError(`Sintaxis inválida en f${i + 1}: ${err.message}`);
      }
    }

    setFormError('');
    const solved = solveNewtonSystem(
      activeEquations.map((equation) => equation.trim()),
      variables,
      activeInitials.map(Number),
      tolerance,
      iterations,
    );
    setResult(solved);
    setSelectedIteration(Math.max(0, solved.iterations.length - 1));
  };

  const exportCSV = () => {
    if (!result?.iterations?.length) return;
    downloadCSV(
      `newton-sistemas-${size}x${size}`,
      [
        'k',
        ...variables.map((v) => `${v}_k`),
        ...variables.map((_, i) => `f${i + 1}(X_k)`),
        ...variables.map((v) => `delta_${v}`),
        'norma ||dX||',
        'det(J)',
        'Error relativo (%)',
      ],
      result.iterations.map((row) => [
        row.iteration,
        ...row.xCurrent.map((v) => v.toFixed(10)),
        ...row.F.map((v) => v.toExponential(6)),
        ...row.deltaX.map((v) => v.toExponential(6)),
        row.normDelta.toExponential(6),
        row.detJ.toExponential(6),
        row.relativeError.toExponential(6),
      ]),
    );
  };

  const singular = Boolean(result && !result.success && /singular/i.test(result.message ?? ''));
  const detail = result?.iterations?.[selectedIteration] ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* ----------------------------------------------- Panel de entrada */}
      <div className="min-w-0 space-y-5 lg:col-span-2">
        <Card>
          <CardHeader
            icon={Grid3x3}
            accent="cyan"
            title="Sistema de ecuaciones no lineales"
            subtitle="Se resuelve J(Xₖ)·ΔX = −F(Xₖ) y luego Xₖ₊₁ = Xₖ + ΔX"
          />
          <CardBody>
            <form onSubmit={handleSolve} className="space-y-4">
              <Field label="Dimensión del sistema">
                <SegmentedControl
                  value={size}
                  onChange={changeSize}
                  options={[
                    { value: 2, label: '2 × 2  (x, y)' },
                    { value: 3, label: '3 × 3  (x, y, z)' },
                  ]}
                />
              </Field>

              <div className="space-y-3">
                {variables.map((_, index) => (
                  <Field
                    key={index}
                    label={`f${index + 1}(${variables.join(', ')}) = 0`}
                    hint="igualada a cero"
                    htmlFor={`newton-eq-${index}`}
                  >
                    <TextInput
                      id={`newton-eq-${index}`}
                      value={equations[index]}
                      onChange={(e) => updateEquation(index, e.target.value)}
                      placeholder={index === 0 ? 'x^2 + y^2 - 4' : 'x - y'}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </Field>
                ))}
              </div>

              <Field label="Vector inicial X₀" hint={`(${variables.join(', ')})`}>
                <div className={`grid gap-2 ${size === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {variables.map((variable, index) => (
                    <div key={variable} className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-[10px] text-slate-500">
                        {variable}₀
                      </span>
                      <TextInput
                        value={initials[index]}
                        onChange={(e) => updateInitial(index, e.target.value)}
                        className="pl-9 text-right"
                        inputMode="decimal"
                        aria-label={`Valor inicial de ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tolerancia ‖ΔX‖" htmlFor="newton-tol">
                  <TextInput
                    id="newton-tol"
                    value={tol}
                    onChange={(e) => setTol(e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Máx. iteraciones" htmlFor="newton-max">
                  <TextInput
                    id="newton-max"
                    value={maxIter}
                    onChange={(e) => setMaxIter(e.target.value)}
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <div className="flex gap-2 pt-1">
                <PrimaryButton type="submit" icon={Play}>
                  Resolver sistema
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

        {/* Jacobiano simbólico en vivo */}
        <Card>
          <CardHeader
            icon={Grid3x3}
            accent="indigo"
            title="Matriz Jacobiana simbólica"
            subtitle="Derivadas parciales ∂fᵢ/∂xⱼ obtenidas con mathjs"
          />
          <CardBody>
            {jacobian.ok ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-1.5" />
                      {variables.map((variable) => (
                        <th key={variable} className="px-3 py-1.5 font-mono text-[11px] text-slate-500">
                          ∂/∂{variable}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jacobian.matrix.map((row, i) => (
                      <tr key={i}>
                        <th className="pr-2 font-mono text-[11px] font-medium text-slate-500">f{i + 1}</th>
                        {row.map((cell, j) => (
                          <td key={j} className="px-1.5 py-1">
                            <span className="block rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 font-mono text-[11px] break-all text-cyan-200">
                              {cell}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Alert tone="warning" icon={TriangleAlert} title="Jacobiano simbólico no disponible">
                {jacobian.error} Si la derivación simbólica falla, el motor usa diferencias finitas centradas.
              </Alert>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            icon={Sparkles}
            accent="emerald"
            title={`Ejemplos ${size} × ${size}`}
            subtitle="Sistemas con solución conocida para validar el método"
          />
          <CardBody className="space-y-2">
            {PRESETS[size].map((preset) => (
              <PresetChip
                key={preset.title}
                title={preset.title}
                detail={preset.equations.join('  ;  ')}
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
              <EmptyState icon={Grid3x3} title="Sistema sin resolver">
                Define las {size} ecuaciones igualadas a cero y el vector inicial X₀, luego presiona{' '}
                <strong className="text-slate-300">Resolver sistema</strong>.
              </EmptyState>
            </CardBody>
          </Card>
        ) : (
          <>
            {singular ? (
              <Alert tone="danger" icon={TriangleAlert} title="Jacobiano singular detectado">
                {result.message} Prueba un vector inicial X₀ distinto: en un punto donde det(J) ≈ 0 el sistema lineal
                J·ΔX = −F no tiene solución única y el método de Newton se detiene.
              </Alert>
            ) : null}

            <Card>
              <CardHeader
                icon={result.success ? CircleCheckBig : TriangleAlert}
                accent={result.success ? 'emerald' : 'amber'}
                title={result.success ? 'Solución encontrada' : 'El método no convergió'}
                subtitle={result.message}
              />
              <CardBody className="space-y-4">
                {result.error ? (
                  <Alert tone="danger" icon={CircleAlert} title="Error de evaluación">
                    {result.error}
                  </Alert>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {result.solution?.map((value, index) => (
                        <StatCard
                          key={variables[index]}
                          label={`${variables[index]} ≈`}
                          value={fmt(value)}
                          tone={result.success ? 'emerald' : 'amber'}
                          icon={Target}
                        />
                      ))}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatCard label="Iteraciones" value={result.totalIterations} tone="indigo" icon={Grid3x3} />
                      <StatCard
                        label="Norma final ‖ΔX‖"
                        value={result.finalError === null ? '—' : result.finalError.toExponential(4)}
                        hint={`tolerancia: ${tol}`}
                        tone="cyan"
                        icon={Activity}
                      />
                      <StatCard
                        label="Residuo ‖F(X)‖"
                        value={
                          detail
                            ? Math.sqrt(
                                result.iterations[result.iterations.length - 1].F.reduce((acc, v) => acc + v * v, 0),
                              ).toExponential(4)
                            : '—'
                        }
                        hint="cercanía real a F(X) = 0"
                        tone="slate"
                        icon={Activity}
                      />
                    </div>
                  </>
                )}
              </CardBody>
            </Card>

            {/* Detalle del Jacobiano numérico por iteración */}
            {detail ? (
              <Card>
                <CardHeader
                  icon={Grid3x3}
                  accent="indigo"
                  title={`Jacobiano evaluado · iteración ${detail.iteration}`}
                  subtitle="Selecciona cualquier fila de la tabla inferior para inspeccionar su paso"
                  action={
                    <Badge tone={Math.abs(detail.detJ) < 1e-8 ? 'rose' : 'indigo'}>
                      det(J) = {detail.detJ.toExponential(4)}
                    </Badge>
                  }
                />
                <CardBody>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div>
                      <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        J(Xₖ)
                      </p>
                      <MatrixDisplay matrix={detail.J} format={(value) => fmt(value, 4)} />
                    </div>

                    <div className="grid flex-1 gap-3 sm:grid-cols-3">
                      <VectorBlock label="Xₖ" values={detail.xCurrent} variables={variables} tone="slate" />
                      <VectorBlock
                        label="F(Xₖ)"
                        values={detail.F}
                        variables={variables.map((_, i) => `f${i + 1}`)}
                        tone="amber"
                        exponential
                      />
                      <VectorBlock
                        label="ΔX"
                        values={detail.deltaX}
                        variables={variables.map((v) => `Δ${v}`)}
                        tone="cyan"
                        exponential
                      />
                    </div>
                  </div>

                  {Math.abs(detail.detJ) < 1e-8 ? (
                    <Alert tone="warning" icon={TriangleAlert} title="Jacobiano casi singular" className="mt-4">
                      |det(J)| = {Math.abs(detail.detJ).toExponential(4)} está muy cerca de cero: la corrección ΔX puede
                      volverse numéricamente inestable.
                    </Alert>
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {result.iterations.length > 0 ? (
              <Card>
                <CardHeader
                  icon={Table}
                  accent="slate"
                  title={`Tabla de iteraciones (${result.iterations.length})`}
                  subtitle="Vector de aproximación, residuos F(X), corrección ΔX y norma euclidiana del error"
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
                        <Th align="left">Xₖ</Th>
                        <Th align="left">F(Xₖ)</Th>
                        <Th align="left">ΔX</Th>
                        <Th>‖ΔX‖₂</Th>
                        <Th>Eᵣ (%)</Th>
                        <Th>det(J)</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.iterations.map((row, index) => {
                        const isSelected = index === selectedIteration;
                        return (
                          <tr
                            key={row.iteration}
                            onClick={() => setSelectedIteration(index)}
                            className={`cursor-pointer border-b border-slate-800/60 transition last:border-0 ${
                              isSelected ? 'bg-indigo-500/10' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <Td align="center" className={isSelected ? 'text-indigo-300' : 'text-slate-500'}>
                              {row.iteration}
                            </Td>
                            <Td align="left" className="text-slate-100">
                              ({row.xCurrent.map((v) => fmt(v)).join(', ')})
                            </Td>
                            <Td align="left" className="text-amber-200/80">
                              ({row.F.map((v) => v.toExponential(2)).join(', ')})
                            </Td>
                            <Td align="left" className="text-cyan-200/80">
                              ({row.deltaX.map((v) => v.toExponential(2)).join(', ')})
                            </Td>
                            <Td className="text-slate-300">{row.normDelta.toExponential(4)}</Td>
                            <Td className="text-slate-400">{fmtPercent(row.relativeError)}</Td>
                            <Td className={Math.abs(row.detJ) < 1e-8 ? 'text-rose-300' : 'text-slate-400'}>
                              {row.detJ.toExponential(3)}
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </TableShell>
                  <p className="mt-2.5 text-[10px] text-slate-500">
                    Haz clic en una fila para ver su Matriz Jacobiana completa en el panel superior.
                  </p>
                </CardBody>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

const VECTOR_TONES = {
  slate: 'border-slate-700/60 bg-slate-800/30 text-slate-200',
  amber: 'border-amber-500/30 bg-amber-500/5 text-amber-200',
  cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-200',
};

/**
 * Bloque compacto para mostrar un vector etiquetado componente a componente.
 */
function VectorBlock({ label, values, variables, tone = 'slate', exponential = false }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${VECTOR_TONES[tone]}`}>
      <p className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">{label}</p>
      <ul className="space-y-1">
        {values.map((value, index) => (
          <li key={index} className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
            <span className="text-slate-500">{variables[index]}</span>
            <span className="tabular-nums">{exponential ? value.toExponential(3) : fmt(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
