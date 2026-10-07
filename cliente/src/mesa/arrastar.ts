// Arrastar cartas com o ponteiro (mouse, caneta ou toque). Um movimento curto continua sendo
// um clique; passando do limite vira arrasto, e o clique que o navegador dispara no fim é
// descartado. A carta "fantasma" que segue o ponteiro tem estado próprio, para a mesa não
// ser redesenhada a cada movimento.

import { useEffect, useState } from 'preact/hooks';
import type { ObjView } from '../../../motor/view.ts';

export interface Fantasma {
  o: ObjView;
  /** posição do canto da carta na tela */
  x: number;
  y: number;
  w: number;
  /** área onde soltar (destacada) e o que acontece ao soltar ali */
  alvo: DOMRect | null;
  texto: string;
  valido: boolean;
  /** voltando para o lugar de origem (soltou fora ou não dava para jogar) */
  voltando?: boolean;
  virada?: boolean;
}

let ouvinte: ((f: Fantasma | null) => void) | null = null;
export function mostrarFantasma(f: Fantasma | null): void { ouvinte?.(f); }
export function useFantasma(): Fantasma | null {
  const [f, setF] = useState<Fantasma | null>(null);
  useEffect(() => { ouvinte = setF; return () => { if (ouvinte === setF) ouvinte = null; }; }, []);
  return f;
}

const LIMITE = 7;

export interface Gesto {
  /** o arrasto começou (passou do limite) */
  inicio: () => void;
  mover: (x: number, y: number) => void;
  soltar: (x: number, y: number) => void;
  cancelar?: () => void;
}

/** chame no pointerdown; devolve sem fazer nada se não for o botão principal. `semArrasto`: soltou sem passar do limite (foi um clique) */
export function acompanharArrasto(ev: PointerEvent, gesto: () => Gesto, semArrasto?: () => void): void {
  if (ev.button !== 0 || !ev.isPrimary) return;
  const x0 = ev.clientX, y0 = ev.clientY;
  let g: Gesto | null = null;
  const mover = (e: PointerEvent) => {
    if (!g) {
      if (Math.hypot(e.clientX - x0, e.clientY - y0) < LIMITE) return;
      g = gesto();
      g.inicio();
    }
    e.preventDefault();
    g.mover(e.clientX, e.clientY);
  };
  const fim = (e: PointerEvent) => {
    removeEventListener('pointermove', mover);
    removeEventListener('pointerup', fim);
    removeEventListener('pointercancel', cancelar);
    if (!g) { semArrasto?.(); return; }
    // o navegador ainda manda um clique depois do arrasto: esse não vale
    const engolir = (c: MouseEvent) => { c.stopPropagation(); c.preventDefault(); };
    addEventListener('click', engolir, { capture: true, once: true });
    setTimeout(() => removeEventListener('click', engolir, { capture: true }), 0);
    g.soltar(e.clientX, e.clientY);
  };
  const cancelar = () => {
    removeEventListener('pointermove', mover);
    removeEventListener('pointerup', fim);
    removeEventListener('pointercancel', cancelar);
    g?.cancelar?.();
  };
  addEventListener('pointermove', mover, { passive: false });
  addEventListener('pointerup', fim);
  addEventListener('pointercancel', cancelar);
}

export const dentro = (r: DOMRect | null, x: number, y: number) => !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
