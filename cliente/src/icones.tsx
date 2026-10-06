// Ícones de linha (traço na cor do texto) e a marca do jogo.

import type { JSX } from 'preact';

function Svg({ children }: { children: JSX.Element | JSX.Element[] }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{children}</svg>;
}

export const IconeRegistro = () => <Svg><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Svg>;
export const IconeParadas = () => <Svg><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z" /><path d="M10 9v6M14 9v6" /></Svg>;
export const IconeAjuste = () => <Svg><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></Svg>;
export const IconeConfig = () => <Svg><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></Svg>;
export const IconeConceder = () => <Svg><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22v-7" /></Svg>;
export const IconeSair = () => <Svg><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></Svg>;
export const IconeFechar = () => <Svg><path d="M18 6L6 18M6 6l12 12" /></Svg>;
export const IconeRecolher = () =><Svg><path d="M9 18l6-6-6-6" /></Svg>;
export const IconePassar = () => <Svg><path d="M5 4l10 8-10 8V4zM19 5v14" /></Svg>;
export const IconeFimTurno = () => <Svg><path d="M13 19l9-7-9-7v14zM2 19l9-7-9-7v14z" /></Svg>;
export const IconeVida = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>;

export const Marca = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <rect x="5" y="6" width="15" height="21" rx="3" fill="#22d36b" opacity=".35" transform="rotate(-12 12 16)" />
    <rect x="12" y="5" width="15" height="21" rx="3" fill="#22d36b" transform="rotate(8 19 15)" />
  </svg>
);
