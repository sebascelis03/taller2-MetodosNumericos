import { useMemo, useState } from 'react';
import {
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  CircleDot,
  FileDown,
  Layers,
  Play,
  Radical,
  RotateCcw,
  Sparkles,
  Table,
  TriangleAlert,
} from 'lucide-react';
import { solveBairstow } from '../methods/bairstow.js';
import { downloadCSV, fmt, polynomialToString, superscript } from '../utils/format.js';
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  PresetChip,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  TableShell,
  Td,
  Th,
  TextInput,
} from './UiKit.jsx';

const MIN_DEGREE = 1;
const MAX_DEGREE = 8;

/** Polinomios clásicos verificados numéricamente (coeficientes de mayor a menor grado). */
const PRESETS = [
  { title: 'x³ − 2x² − 5x + 6   →   1, 3, −2', coefficients: ['1', '-2', '-5', '6'] },
  { title: 'x³ + x² + x + 1   →   −1, ±i', coefficients: ['1', '1', '1', '1'] },
  { title: 'x⁴ − 3x³ + 3x² − 3x + 2   →   1, 2, ±i', coefficients: ['1', '-3', '3', '-3', '2'] },
  { title: 'x⁴ + 1   →   4 raíces complejas', coefficients: ['1', '0', '0', '0', '1'] },
  {
    title: 'Grado 5 clásico   →   2, −1, 0.5, 1 ± 0.5i',
    coefficients: ['1', '-3.5', '2.75', '2.125', '-3.875', '1.25'],
  },
  { title: 'x⁵ − 3x³ + 6x² − 28x + 24   →   1, 2, −3, ±2i', coefficients: ['1', '0', '-3', '6', '-28', '24'] },
];

/** Crea un arreglo de coeficientes del tamaño pedido, conservando los valores existentes. */
function resizeCoefficients(current, degree) {
  const length = degree + 1;
  const next = new Array(length).fill('0');
  // Se alinea por grado (desde el término constante) para no desplazar el polinomio
  for (let i = 0; i < Math.min(current.length, length); i++) {
    next[length - 1 - i] = current[current.length - 1 - i];
  }
  if (!Number.parseFloat(next[0])) next[0] = '1';
  return next;
}

export default function BairstowCalculator() {
  const [degree, setDegree] = useState(3);
  const [coefficients, setCoefficients] = useState(['1', '-2', '-5', '6']);
  const [r0, setR0] = useState('0.5');
  const [s0, setS0] = useState('0.5');
  const [tol, setTol] = useState('0.00000001');
  const [maxIter, setMaxIter] = useState('200');
  const [bulk, setBulk] = useState('');
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');
  const [openStage, setOpenStage] = useState(0);

  const numericCoefficients = useMemo(() => coefficients.map((value) => Number(value)), [coefficients]);
  const preview = useMemo(
    () => (numericCoefficients.every(Number.isFinite) ? polynomialToString(numericCoefficients) : null),
    [numericCoefficients],
  );

  const changeDegree = (next) => {
    setDegree(next);
    setCoefficients((prev) => resizeCoefficients(prev, next));
    setResult(null);
    setFormError('');
  };

  const updateCoefficient = (index, value) => {
    setCoefficients((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const applyPreset = (preset) => {
    setCoefficients(preset.coefficients);
    setDegree(preset.coefficients.length - 1);
    setBulk('');
    setResult(null);
    setFormError('');
  };

  /** Carga coeficientes desde una lista pegada por el usuario. */
  const applyBulk = () => {
    const parsed = bulk
      .split(/[,;\s]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (parsed.length < 2) return setFormError('Ingresa al menos 2 coeficientes separados por coma o espacio.');
    if (parsed.length - 1 > MAX_DEGREE) return setFormError(`El grado máximo soportado es ${MAX_DEGREE}.`);
    if (parsed.some((token) => !Number.isFinite(Number(token)))) {
      return setFormError('La lista contiene valores que no son numéricos.');
    }

    setCoefficients(parsed);
    setDegree(parsed.length - 1);
    setResult(null);
    setFormError('');
  };

  const reset = () => {
    setCoefficients(resizeCoefficients(['1'], degree));
    setR0('0.5');
    setS0('0.5');
    setTol('0.00000001');
    setMaxIter('200');
    setBulk('');
    setResult(null);
    setFormError('');
  };

  const handleSolve = (event) => {
    event.preventDefault();

    if (!numericCoefficients.every(Number.isFinite)) {
      return setFormError('Todos los coeficientes deben ser números reales.');
    }
    if (Math.abs(numericCoefficients[0]) < 1e-12) {
      return setFormError(`El coeficiente principal a${degree} no puede ser cero (reduce el grado del polinomio).`);
    }
    if (!Number.isFinite(Number(r0)) || !Number.isFinite(Number(s0))) {
      return setFormError('Los valores iniciales r y s deben ser números válidos.');
    }

    const tolerance = Number(tol);
    if (!Number.isFinite(tolerance) || tolerance <= 0) return setFormError('La tolerancia debe ser un número positivo.');

    const iterations = Number.parseInt(maxIter, 10);
    if (!Number.isInteger(iterations) || iterations < 1 || iterations > 5000) {
      return setFormError('El número máximo de iteraciones debe ser un entero entre 1 y 5000.');
    }

    setFormError('');
    const solved = solveBairstow(numericCoefficients, Number(r0), Number(s0), tolerance, iterations);
    setResult(solved);
    setOpenStage(0);
  };

  const exportCSV = () => {
    if (!result?.stages?.length) return;
    const rows = [];
    result.stages.forEach((stage) => {
      stage.iterations.forEach((row) => {
        rows.push([
          stage.stage,
          stage.polynomialDegree,
          row.iteration,
          row.r.toFixed(10),
          row.s.toFixed(10),
          row.deltaR.toExponential(6),
          row.deltaS.toExponential(6),
          row.errR.toExponential(6),
          row.errS.toExponential(6),
          row.b0.toExponential(6),
          row.b1.toExponential(6),
        ]);
      });
    });

    downloadCSV(
      'bairstow',
      ['Etapa', 'Grado', 'k', 'r', 's', 'delta_r', 'delta_s', 'Error r (%)', 'Error s (%)', 'b0', 'b1'],
      rows,
    );
  };

  const realRoots = result?.roots?.filter((root) => root.imag === 0) ?? [];
  const complexRoots = result?.roots?.filter((root) => root.imag !== 0) ?? [];
  const nonConvergedStages = result?.stages?.filter((stage) => stage.iterations.length > 0 && !stage.converged) ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* ----------------------------------------------- Panel de entrada */}
      <div className="min-w-0 space-y-5 lg:col-span-2">
        <Card>
          <CardHeader
            icon={Radical}
            accent="emerald"
            title="Polinomio y parámetros"
            subtitle="Extrae factores cuadráticos x² − r·x − s y deflacta el polinomio"
          />
          <CardBody>
            <form onSubmit={handleSolve} className="space-y-4">
              <Field label="Grado del polinomio" hint={`${MIN_DEGREE} a ${MAX_DEGREE}`}>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: MAX_DEGREE - MIN_DEGREE + 1 }, (_, i) => i + MIN_DEGREE).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => changeDegree(value)}
                      className={`size-9 rounded-xl border font-mono text-xs font-semibold transition ${
                        value === degree
                          ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
                          : 'border-slate-700/70 bg-slate-950/70 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Coeficientes (de mayor a menor grado)" hint="aₙ … a₀">
                <div className="space-y-2">
                  {coefficients.map((value, index) => {
                    const power = degree - index;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 font-mono text-[11px] text-slate-500">
                          a{power === 0 ? '₀' : subscript(power)}
                        </span>
                        <TextInput
                          value={value}
                          onChange={(e) => updateCoefficient(index, e.target.value)}
                          className="text-right"
                          inputMode="decimal"
                          aria-label={`Coeficiente de x^${power}`}
                        />
                        <span className="w-12 shrink-0 font-mono text-[11px] text-slate-500">
                          {power === 0 ? '·1' : power === 1 ? '·x' : `·x${superscript(power)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Field>

              {preview ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-3">
                  <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Polinomio ingresado
                  </p>
                  <p className="font-mono text-sm break-words text-emerald-200">P(x) = {preview}</p>
                </div>
              ) : null}

              <Field label="Carga rápida de coeficientes" hint="separa con coma o espacio" htmlFor="bair-bulk">
                <div className="flex gap-2">
                  <TextInput
                    id="bair-bulk"
                    value={bulk}
                    onChange={(e) => setBulk(e.target.value)}
                    placeholder="1, -3.5, 2.75, 2.125, -3.875, 1.25"
                  />
                  <SecondaryButton type="button" onClick={applyBulk} className="shrink-0">
                    Cargar
                  </SecondaryButton>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor inicial r" htmlFor="bair-r">
                  <TextInput id="bair-r" value={r0} onChange={(e) => setR0(e.target.value)} inputMode="decimal" />
                </Field>
                <Field label="Valor inicial s" htmlFor="bair-s">
                  <TextInput id="bair-s" value={s0} onChange={(e) => setS0(e.target.value)} inputMode="decimal" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tolerancia" htmlFor="bair-tol">
                  <TextInput id="bair-tol" value={tol} onChange={(e) => setTol(e.target.value)} inputMode="decimal" />
                </Field>
                <Field label="Máx. iteraciones" htmlFor="bair-max">
                  <TextInput
                    id="bair-max"
                    value={maxIter}
                    onChange={(e) => setMaxIter(e.target.value)}
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <div className="flex gap-2 pt-1">
                <PrimaryButton type="submit" icon={Play}>
                  Calcular raíces
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

        <Card>
          <CardHeader
            icon={Sparkles}
            accent="cyan"
            title="Polinomios de ejemplo"
            subtitle="Casos con raíces reales, complejas conjugadas y mixtas"
          />
          <CardBody className="space-y-2">
            {PRESETS.map((preset) => (
              <PresetChip
                key={preset.title}
                title={preset.title}
                detail={`[${preset.coefficients.join(', ')}]`}
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
              <EmptyState icon={Radical} title="Polinomio sin resolver">
                Define el grado y los coeficientes del polinomio, luego presiona{' '}
                <strong className="text-slate-300">Calcular raíces</strong> para ver la clasificación de raíces y el
                desglose de cada deflación.
              </EmptyState>
            </CardBody>
          </Card>
        ) : !result.success ? (
          <Alert tone="danger" icon={CircleAlert} title="No fue posible calcular las raíces">
            {result.message}
          </Alert>
        ) : (
          <>
            {nonConvergedStages.length > 0 ? (
              <Alert tone="warning" icon={TriangleAlert} title="Algunas etapas no alcanzaron la tolerancia">
                {nonConvergedStages.length} factor(es) cuadrático(s) agotaron las {maxIter} iteraciones. Las raíces
                mostradas son la mejor aproximación obtenida: prueba otros valores iniciales de r y s, o aumenta el
                máximo de iteraciones.
              </Alert>
            ) : null}

            <Card>
              <CardHeader
                icon={CircleCheckBig}
                accent="emerald"
                title={`${result.roots.length} raíces del polinomio de grado ${result.originalDegree}`}
                subtitle={result.message}
              />
              <CardBody className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Raíces reales" value={realRoots.length} tone="emerald" icon={CircleDot} />
                  <StatCard label="Raíces complejas" value={complexRoots.length} tone="cyan" icon={CircleDot} />
                  <StatCard
                    label="Iteraciones totales"
                    value={result.totalIterations}
                    hint={`${result.stages.length} etapa(s)`}
                    tone="indigo"
                    icon={Layers}
                  />
                </div>

                {realRoots.length > 0 ? (
                  <RootGroup
                    title="Raíces reales"
                    roots={realRoots}
                    tone="emerald"
                    renderValue={(root) => fmt(root.real)}
                  />
                ) : null}

                {complexRoots.length > 0 ? (
                  <RootGroup
                    title="Raíces complejas conjugadas (a ± bi)"
                    roots={complexRoots}
                    tone="cyan"
                    renderValue={(root) => (
                      <>
                        {fmt(root.real)} {root.imag >= 0 ? '+' : '−'} {fmt(Math.abs(root.imag))}
                        <span className="text-cyan-400">i</span>
                      </>
                    )}
                  />
                ) : null}
              </CardBody>
            </Card>

            {/* Factores cuadráticos extraídos */}
            {result.quadraticFactors.length > 0 ? (
              <Card>
                <CardHeader
                  icon={Layers}
                  accent="amber"
                  title="Factores cuadráticos extraídos"
                  subtitle="Cada factor x² − r·x − s se obtiene por iteración y luego se deflacta del polinomio"
                />
                <CardBody>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {result.quadraticFactors.map((factor, index) => (
                      <li
                        key={index}
                        className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3.5 py-2.5"
                      >
                        <p className="font-mono text-xs text-amber-200">{factor.factor}</p>
                        <p className="mt-1 font-mono text-[10px] text-slate-500">
                          r = {fmt(factor.r)} · s = {fmt(factor.s)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ) : null}

            {/* Desglose por etapas de deflación */}
            <Card>
              <CardHeader
                icon={Table}
                accent="slate"
                title="Desglose por etapas de deflación"
                subtitle="Refinamiento iterativo de r y s en cada factor cuadrático"
                action={
                  result.totalIterations > 0 ? (
                    <SecondaryButton type="button" icon={FileDown} onClick={exportCSV}>
                      Exportar CSV
                    </SecondaryButton>
                  ) : null
                }
              />
              <CardBody className="space-y-3">
                {result.stages.map((stage, index) => {
                  const isOpen = index === openStage;
                  return (
                    <div key={stage.stage} className="overflow-hidden rounded-xl border border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setOpenStage(isOpen ? -1 : index)}
                        className="flex w-full items-center justify-between gap-3 bg-slate-950/50 px-4 py-3 text-left transition hover:bg-slate-900/70"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <ChevronRight
                            className={`size-4 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-slate-200">
                              Etapa {stage.stage} · grado {stage.polynomialDegree}
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">
                              {stage.polynomialCoefficients
                                ? `P(x) = ${polynomialToString(stage.polynomialCoefficients)}`
                                : ''}
                            </span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {stage.note ? (
                            <Badge tone="slate">directo</Badge>
                          ) : stage.converged ? (
                            <Badge tone="emerald">convergió</Badge>
                          ) : (
                            <Badge tone="amber">máx. iter.</Badge>
                          )}
                          <Badge tone="indigo">{stage.iterations.length} iter.</Badge>
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="space-y-3 border-t border-slate-800/80 px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {stage.extractedRoots.map((root, i) => (
                              <Badge key={i} tone={root.imag === 0 ? 'emerald' : 'cyan'} icon={CircleDot}>
                                {root.text}
                              </Badge>
                            ))}
                            {stage.deflatedPolynomial ? (
                              <Badge tone="slate">
                                deflactado → {polynomialToString(stage.deflatedPolynomial)}
                              </Badge>
                            ) : null}
                          </div>

                          {stage.note ? (
                            <Alert tone="neutral" icon={CircleCheckBig}>
                              {stage.note}
                            </Alert>
                          ) : (
                            <>
                              <div className="grid gap-2.5 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 px-3 py-2">
                                  <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                    r final
                                  </p>
                                  <p className="mt-0.5 font-mono text-sm text-slate-100">{fmt(stage.rFinal)}</p>
                                </div>
                                <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 px-3 py-2">
                                  <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                    s final
                                  </p>
                                  <p className="mt-0.5 font-mono text-sm text-slate-100">{fmt(stage.sFinal)}</p>
                                </div>
                              </div>

                              <TableShell className="max-h-80 overflow-y-auto">
                                <thead>
                                  <tr>
                                    <Th align="center">k</Th>
                                    <Th>r</Th>
                                    <Th>s</Th>
                                    <Th>Δr</Th>
                                    <Th>Δs</Th>
                                    <Th>Eᵣ (%)</Th>
                                    <Th>Eₛ (%)</Th>
                                    <Th>b₀</Th>
                                    <Th>b₁</Th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {stage.iterations.map((row) => (
                                    <tr
                                      key={row.iteration}
                                      className="border-b border-slate-800/60 transition last:border-0 hover:bg-slate-800/40"
                                    >
                                      <Td align="center" className="text-slate-500">
                                        {row.iteration}
                                      </Td>
                                      <Td className="text-slate-100">{fmt(row.r)}</Td>
                                      <Td className="text-slate-100">{fmt(row.s)}</Td>
                                      <Td className="text-cyan-200/80">{row.deltaR.toExponential(3)}</Td>
                                      <Td className="text-cyan-200/80">{row.deltaS.toExponential(3)}</Td>
                                      <Td className="text-slate-400">{row.errR.toExponential(3)}</Td>
                                      <Td className="text-slate-400">{row.errS.toExponential(3)}</Td>
                                      <Td className="text-amber-200/70">{row.b0.toExponential(3)}</Td>
                                      <Td className="text-amber-200/70">{row.b1.toExponential(3)}</Td>
                                    </tr>
                                  ))}
                                </tbody>
                              </TableShell>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

const SUBSCRIPTS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** Convierte un entero a subíndice unicode para etiquetar coeficientes. */
function subscript(n) {
  return String(n)
    .split('')
    .map((d) => SUBSCRIPTS[Number(d)] ?? d)
    .join('');
}

const ROOT_TONES = {
  emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
  cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-200',
};

/**
 * Grupo de tarjetas de raíces clasificadas.
 */
function RootGroup({ title, roots, tone, renderValue }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">{title}</p>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {roots.map((root, index) => (
          <li key={index} className={`rounded-xl border px-3.5 py-2.5 ${ROOT_TONES[tone]}`}>
            <p className="text-[10px] font-semibold text-slate-500">x{subscript(index + 1)}</p>
            <p className="mt-0.5 font-mono text-sm break-all">{renderValue(root)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
