import { Grid3x3, Radical, Repeat } from 'lucide-react';

/**
 * Catálogo de los tres métodos numéricos del Taller 2.
 * El `id` es la clave de enrutamiento interno usada por App.jsx y Tabs.jsx.
 *
 * Vive en su propio módulo (y no en Tabs.jsx) para que el Fast Refresh de React
 * siga funcionando: los archivos de componentes no deben exportar constantes.
 */
export const METHODS = [
  {
    id: 'sequential',
    number: '1',
    label: 'Iterativo Secuencial',
    short: 'Secuencial',
    description: 'Punto fijo x = g(x)',
    icon: Repeat,
  },
  {
    id: 'newton',
    number: '2',
    label: 'Newton para Sistemas',
    short: 'Newton',
    description: 'Matriz Jacobiana J(X)',
    icon: Grid3x3,
  },
  {
    id: 'bairstow',
    number: '3',
    label: 'Método de Bairstow',
    short: 'Bairstow',
    description: 'Raíces de polinomios',
    icon: Radical,
  },
];
