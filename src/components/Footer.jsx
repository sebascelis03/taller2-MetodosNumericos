import { BookOpen, Cpu, GraduationCap, Sigma } from 'lucide-react';

const STUDENTS = [
  'Andrés Esteban Sandoval Carreño',
  'Jhoan Sebastian Celis Pabón',
  'Zharick Nicolle Acevedo Ascanio',
];

const STACK = ['React 19', 'Vite 8', 'Tailwind CSS v4', 'math.js', 'PWA · Service Worker'];

/** Se calcula una sola vez al cargar el módulo para mantener el render puro. */
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="rounded-3xl border border-slate-800/80 bg-slate-900/60 px-5 py-7 backdrop-blur-md sm:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Identidad del proyecto */}
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-slate-300 uppercase">
            <Sigma className="size-4 text-indigo-400" />
            Métodos Numéricos
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Aplicación web progresiva desarrollada como <strong className="text-slate-300">Taller 2</strong> de la
            cátedra de Métodos Numéricos. Implementa el Método Iterativo Secuencial, el Método de Newton para sistemas
            de ecuaciones no lineales y el Método de Bairstow, mostrando en cada caso el desarrollo iterativo completo.
          </p>
        </div>

        {/* Créditos académicos */}
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-slate-300 uppercase">
            <GraduationCap className="size-4 text-cyan-400" />
            Autoría
          </p>
          <ul className="mt-3 space-y-1.5">
            {STUDENTS.map((student) => (
              <li key={student} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-cyan-500" aria-hidden="true" />
                {student}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">
            Fundación de Estudios Superiores Comfanorte (FESC) · Ingeniería de Software · Séptimo Semestre · 2026-2
          </p>
        </div>

        {/* Stack técnico */}
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-slate-300 uppercase">
            <Cpu className="size-4 text-emerald-400" />
            Tecnologías
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {STACK.map((item) => (
              <li
                key={item}
                className="rounded-full border border-slate-700/70 bg-slate-950/60 px-2.5 py-1 font-mono text-[10px] text-slate-400"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
            <BookOpen className="mt-0.5 size-3.5 shrink-0" />
            Los algoritmos siguen las formulaciones clásicas de Chapra &amp; Canale y Burden &amp; Faires.
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col items-center justify-between gap-2 border-t border-slate-800/70 pt-5 sm:flex-row">
        <p className="text-[11px] text-slate-500">
          © {CURRENT_YEAR} · Taller 2 de Métodos Numéricos · FESC 2026-2
        </p>
        <p className="font-mono text-[11px] text-slate-600">
          Funciona sin conexión gracias al Service Worker de la PWA
        </p>
      </div>
    </footer>
  );
}
