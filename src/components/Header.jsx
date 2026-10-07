import { useEffect, useState } from 'react';
import { Download, GraduationCap, Layers, Sigma, Users, Wifi, WifiOff, ShieldCheck } from 'lucide-react';
import { Badge } from './UiKit.jsx';

/** Integrantes del grupo de trabajo (Taller 2 - Métodos Numéricos). */
const STUDENTS = [
  { name: 'Andrés Esteban Sandoval Carreño', initials: 'AS', accent: 'from-indigo-500 to-indigo-700' },
  { name: 'Jhoan Sebastian Celis Pabón', initials: 'JC', accent: 'from-cyan-500 to-cyan-700' },
  { name: 'Zharick Nicolle Acevedo Ascanio', initials: 'ZA', accent: 'from-emerald-500 to-emerald-700' },
];

const INSTITUTIONAL_BADGES = [
  { label: 'FESC 2026-2', icon: GraduationCap, tone: 'indigo' },
  { label: 'Ingeniería de Software', icon: Layers, tone: 'cyan' },
  { label: 'Séptimo Semestre', icon: Users, tone: 'emerald' },
];

/**
 * Hook que expone el estado de conexión del navegador.
 * @returns {boolean} true si hay conexión
 */
function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}

/**
 * Detecta si la aplicación se está ejecutando ya instalada (modo standalone).
 * @returns {boolean}
 */
function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

/**
 * Hook que captura el evento `beforeinstallprompt` para ofrecer la instalación de la PWA.
 * @returns {{canInstall: boolean, installed: boolean, promptInstall: Function}}
 */
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  // Si la app ya corre en modo standalone, está instalada: se resuelve al inicializar el estado.
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return { canInstall: Boolean(deferredPrompt) && !installed, installed, promptInstall };
}

export default function Header() {
  const online = useOnlineStatus();
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/70 shadow-2xl shadow-slate-950/60 backdrop-blur-md">
      {/* Resplandores decorativos de fondo */}
      <div
        className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-indigo-600/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 -bottom-28 size-72 rounded-full bg-cyan-500/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Identidad de la aplicación */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/30">
                <Sigma className="size-6 text-white" strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <h1 className="bg-gradient-to-r from-indigo-300 via-slate-100 to-cyan-300 bg-clip-text text-2xl leading-tight font-extrabold tracking-tight text-transparent sm:text-3xl">
                  Calculadora de Métodos Numéricos
                </h1>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Taller 2 · Resolución paso a paso con tablas de iteración y diagnóstico de convergencia
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {INSTITUTIONAL_BADGES.map((badge) => (
                <Badge key={badge.label} tone={badge.tone} icon={badge.icon}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Controles de estado y PWA */}
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                online
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              }`}
            >
              {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
              <span className="relative flex size-1.5">
                <span
                  className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${
                    online ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className={`relative inline-flex size-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </span>
              {online ? 'En línea' : 'Sin conexión'}
            </span>

            {installed ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold text-indigo-300">
                <ShieldCheck className="size-3.5" />
                App instalada
              </span>
            ) : canInstall ? (
              <button
                type="button"
                onClick={promptInstall}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-600 hover:to-cyan-600 focus:ring-2 focus:ring-indigo-400/60 focus:outline-none"
              >
                <Download className="size-3.5" />
                Instalar App
              </button>
            ) : (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/60 px-3 py-1.5 text-[11px] font-semibold text-slate-400"
                title="El navegador ofrecerá la instalación cuando se cumplan sus criterios (HTTPS y service worker activo)."
              >
                <Download className="size-3.5" />
                PWA lista
              </span>
            )}
          </div>
        </div>

        {/* Integrantes del grupo */}
        <div className="mt-7 border-t border-slate-800/70 pt-5">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-slate-500 uppercase">
            <Users className="size-3.5" />
            Integrantes del grupo
          </p>
          <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {STUDENTS.map((student) => (
              <li
                key={student.name}
                className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-950/50 px-3 py-2.5 transition hover:border-slate-700 hover:bg-slate-900/70"
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${student.accent} text-xs font-bold text-white shadow-md`}
                >
                  {student.initials}
                </span>
                <span className="min-w-0 text-xs leading-snug font-medium text-slate-200">{student.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
