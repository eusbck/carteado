// A carta sob o mouse (o zoom ao lado da mesa) fica fora do estado da mesa: passar o mouse de carta em carta só
// redesenha o zoom, não a mesa inteira com as suas cem cartas.

import { useEffect, useState } from 'preact/hooks';
import type { ObjView } from '../../../motor/view.ts';

export interface ZoomAtual { o: ObjView; lado: 'esq' | 'dir' }

let atual: ZoomAtual | null = null;
const ouvintes = new Set<() => void>();

function avisar(): void { for (const f of ouvintes) f(); }

/** mostra o zoom da carta (do lado oposto ao dela na tela), ou esconde com `null` */
export function mostrarZoom(o: ObjView | null, r?: DOMRect): void {
  const novo = o && r ? { o, lado: (r.left + r.width / 2 < innerWidth / 2 ? 'dir' : 'esq') as ZoomAtual['lado'] } : null;
  if (novo === atual || (novo && atual && novo.o === atual.o && novo.lado === atual.lado)) return;
  atual = novo;
  avisar();
}

export function esconderZoom(): void { mostrarZoom(null); }

export function useZoom(): ZoomAtual | null {
  const [, forcar] = useState(0);
  useEffect(() => {
    const f = () => forcar((x) => x + 1);
    ouvintes.add(f);
    return () => { ouvintes.delete(f); };
  }, []);
  return atual;
}
