import { LoaderCircle } from 'lucide-react';

/**
 * Kit de primitivas visuales compartidas por las tres calculadoras.
 * Mantiene la coherencia del tema "Dark Tech / Scientific Dashboard".
 *
 * Nota sobre Tailwind v4: las clases se escriben como cadenas literales completas
 * (nunca interpoladas tipo `bg-${color}-500`) para que el escáner del compilador
 * las detecte y las incluya en el CSS final.
 */

/* ------------------------------------------------------------------ Contenedores */

export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl shadow-slate-950/60 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

const HEADER_ACCENTS = {
  indigo: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  slate: 'bg-slate-500/10 text-slate-300 ring-slate-500/30',
};

export function CardHeader({ icon: Icon, title, subtitle, accent = 'indigo', action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800/70 px-5 py-4">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ring-1 ${HEADER_ACCENTS[accent]}`}>
            <Icon className="size-[18px]" strokeWidth={2} />
          </span>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-5 ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ Formularios */

export function Field({ label, hint, htmlFor, children, className = '' }) {
  return (
    <label className={`block ${className}`} htmlFor={htmlFor}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-slate-300">{label}</span>
        {hint ? <span className="font-mono text-[10px] text-slate-500">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const INPUT_BASE =
  'w-full rounded-xl border border-slate-700/70 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 ' +
  'placeholder:text-slate-600 transition outline-none ' +
  'focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export function TextInput({ mono = true, invalid = false, className = '', ...props }) {
  return (
    <input
      {...props}
      className={`${INPUT_BASE} ${mono ? 'font-mono' : ''} ${
        invalid ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/25' : ''
      } ${className}`}
    />
  );
}

/**
 * Control segmentado para elegir entre opciones mutuamente excluyentes.
 * @param {{options: Array<{value: any, label: string}>, value: any, onChange: Function}} props
 */
export function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex w-full rounded-xl border border-slate-700/70 bg-slate-950/70 p-1 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              active
                ? 'bg-indigo-500/90 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ Botones */

export function PrimaryButton({ children, loading = false, icon: Icon, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-cyan-600 focus:ring-2 focus:ring-indigo-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, icon: Icon, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-slate-100 focus:ring-2 focus:ring-slate-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {children}
    </button>
  );
}

/**
 * Chip para cargar un ejemplo predefinido con un clic.
 */
export function PresetChip({ title, detail, tone = 'slate', onClick }) {
  const TONES = {
    slate: 'hover:border-indigo-500/50 hover:bg-indigo-500/5',
    amber: 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 hover:bg-amber-500/10',
    cyan: 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/60 hover:bg-cyan-500/10',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2 text-left transition ${TONES[tone]}`}
    >
      <span className="block text-[11px] font-semibold text-slate-200 group-hover:text-white">{title}</span>
      <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500 group-hover:text-slate-400">
        {detail}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ Retroalimentación */

const ALERT_TONES = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  danger: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  neutral: 'border-slate-700/60 bg-slate-800/40 text-slate-300',
};

export function Alert({ tone = 'info', icon: Icon, title, children, className = '' }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${ALERT_TONES[tone]} ${className}`}>
      {Icon ? <Icon className="mt-0.5 size-4 shrink-0" /> : null}
      <div className="min-w-0 text-xs leading-relaxed">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? 'mt-1 text-slate-300' : 'text-slate-300'}>{children}</div> : null}
      </div>
    </div>
  );
}

const STAT_TONES = {
  indigo: 'border-indigo-500/30 bg-indigo-500/5',
  cyan: 'border-cyan-500/30 bg-cyan-500/5',
  emerald: 'border-emerald-500/30 bg-emerald-500/5',
  amber: 'border-amber-500/30 bg-amber-500/5',
  rose: 'border-rose-500/30 bg-rose-500/5',
  slate: 'border-slate-700/60 bg-slate-800/30',
};

const STAT_VALUE_TONES = {
  indigo: 'text-indigo-200',
  cyan: 'text-cyan-200',
  emerald: 'text-emerald-200',
  amber: 'text-amber-200',
  rose: 'text-rose-200',
  slate: 'text-slate-100',
};

export function StatCard({ label, value, hint, tone = 'slate', icon: Icon }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${STAT_TONES[tone]}`}>
      <div className="flex items-center gap-1.5">
        {Icon ? <Icon className="size-3.5 text-slate-400" /> : null}
        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
      </div>
      <p className={`mt-1.5 font-mono text-lg leading-tight break-all ${STAT_VALUE_TONES[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-[10px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

const BADGE_TONES = {
  indigo: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  rose: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  slate: 'border-slate-700/70 bg-slate-800/60 text-slate-300',
};

export function Badge({ tone = 'slate', icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${BADGE_TONES[tone]} ${className}`}
    >
      {Icon ? <Icon className="size-3" /> : null}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ Tablas */

export function TableShell({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-800/80 ${className}`}>
      <table className="w-full min-w-max border-collapse text-xs">{children}</table>
    </div>
  );
}

/**
 * Encabezado de tabla fijo al desplazar.
 * Usa `bg-slate-900` opaco (no translúcido) para que las filas no se vean a través de él.
 */
export function Th({ children, align = 'right', className = '' }) {
  const alignment = align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right';
  return (
    <th
      className={`sticky top-0 z-10 border-b border-slate-800 bg-slate-900 px-3 py-2.5 font-semibold tracking-wide whitespace-nowrap text-slate-300 ${alignment} ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = 'right', mono = true, className = '' }) {
  const alignment = align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right';
  return (
    <td className={`px-3 py-2 whitespace-nowrap text-slate-300 ${mono ? 'font-mono' : ''} ${alignment} ${className}`}>
      {children}
    </td>
  );
}

/**
 * Estado vacío mostrado antes de ejecutar un cálculo.
 */
export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-14 text-center">
      {Icon ? (
        <span className="grid size-12 place-items-center rounded-2xl bg-slate-800/60 text-slate-500">
          <Icon className="size-6" />
        </span>
      ) : null}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {children ? <p className="max-w-sm text-xs leading-relaxed text-slate-500">{children}</p> : null}
    </div>
  );
}

/**
 * Matriz numérica con corchetes, usada para el Jacobiano.
 * @param {{matrix: Array<Array<number>>, labels?: Array<string>, format: Function}} props
 */
export function MatrixDisplay({ matrix, format, className = '' }) {
  if (!Array.isArray(matrix) || matrix.length === 0) return null;

  return (
    <div className={`flex items-stretch gap-1.5 ${className}`}>
      <span className="w-2 rounded-l-md border-y-2 border-l-2 border-slate-600" aria-hidden="true" />
      <div
        className="grid gap-x-5 gap-y-1.5 py-1"
        style={{ gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` }}
      >
        {matrix.flatMap((row, i) =>
          row.map((cell, j) => (
            <span key={`${i}-${j}`} className="text-right font-mono text-xs text-slate-200 tabular-nums">
              {format(cell)}
            </span>
          )),
        )}
      </div>
      <span className="w-2 rounded-r-md border-y-2 border-r-2 border-slate-600" aria-hidden="true" />
    </div>
  );
}
