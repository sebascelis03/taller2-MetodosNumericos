import { METHODS } from '../config/methods.js';

const ACTIVE_STYLES = {
  sequential: 'border-indigo-500/60 bg-indigo-500/10 shadow-indigo-500/10',
  newton: 'border-cyan-500/60 bg-cyan-500/10 shadow-cyan-500/10',
  bairstow: 'border-emerald-500/60 bg-emerald-500/10 shadow-emerald-500/10',
};

const ACTIVE_ICON_STYLES = {
  sequential: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-500/40',
  newton: 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-cyan-500/40',
  bairstow: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-emerald-500/40',
};

const INDICATOR_STYLES = {
  sequential: 'bg-indigo-400',
  newton: 'bg-cyan-400',
  bairstow: 'bg-emerald-400',
};

/**
 * Selector de método con indicador visual suave.
 * @param {{active: string, onChange: (id: string) => void}} props
 */
export default function Tabs({ active, onChange }) {
  return (
    <nav aria-label="Selector de método numérico">
      <ul className="grid gap-3 sm:grid-cols-3">
        {METHODS.map((method) => {
          const Icon = method.icon;
          const isActive = method.id === active;

          return (
            <li key={method.id}>
              <button
                type="button"
                onClick={() => onChange(method.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative w-full overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                  isActive
                    ? `${ACTIVE_STYLES[method.id]} shadow-lg`
                    : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? `${ACTIVE_ICON_STYLES[method.id]} shadow-lg`
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-semibold transition-colors ${
                        isActive ? 'text-slate-50' : 'text-slate-300 group-hover:text-slate-100'
                      }`}
                    >
                      <span className="mr-1.5 font-mono text-xs text-slate-500">{method.number}.</span>
                      {method.label}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">{method.description}</p>
                  </div>
                </div>

                {/* Indicador inferior animado */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300 ${
                    INDICATOR_STYLES[method.id]
                  } ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
