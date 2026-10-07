import { useState } from 'react';
import Header from './components/Header.jsx';
import Tabs from './components/Tabs.jsx';
import { METHODS } from './config/methods.js';
import SequentialCalculator from './components/SequentialCalculator.jsx';
import NewtonSystemCalculator from './components/NewtonSystemCalculator.jsx';
import BairstowCalculator from './components/BairstowCalculator.jsx';
import Footer from './components/Footer.jsx';

/** Mapa de métodos a su componente de cálculo. */
const CALCULATORS = {
  sequential: SequentialCalculator,
  newton: NewtonSystemCalculator,
  bairstow: BairstowCalculator,
};

export default function App() {
  const [method, setMethod] = useState('sequential');

  const ActiveCalculator = CALCULATORS[method];
  const activeMethod = METHODS.find((item) => item.id === method);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950">
      {/* Malla y resplandores de fondo del tablero científico */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-indigo-700/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-52 -left-32 size-[32rem] rounded-full bg-cyan-700/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
        <Header />

        <Tabs active={method} onChange={setMethod} />

        {/* Encabezado contextual del método activo */}
        <section aria-live="polite">
          <div className="mb-5 flex items-center gap-3 px-1">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-slate-800" aria-hidden="true" />
            <h2 className="text-center text-[11px] font-bold tracking-[0.22em] text-slate-500 uppercase">
              Método {activeMethod.number} · {activeMethod.label}
            </h2>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-800 to-slate-800" aria-hidden="true" />
          </div>

          {/* La clave fuerza el remontaje al cambiar de método, limpiando resultados previos */}
          <ActiveCalculator key={method} />
        </section>

        <Footer />
      </div>
    </div>
  );
}
