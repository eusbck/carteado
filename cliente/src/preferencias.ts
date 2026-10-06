// Preferências desta pessoa neste navegador (não vão para o servidor).

import { useEffect, useState } from 'preact/hooks';

export interface Preferencias {
  /** paga sozinho todo custo de mana que der para pagar (senão você clica nos terrenos) */
  pagarAuto: boolean;
}

const CHAVE = 'commander-da-mesa:preferencias';
const PADRAO: Preferencias = { pagarAuto: false };

function ler(): Preferencias {
  try { return { ...PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) ?? '{}') }; } catch { return { ...PADRAO }; }
}

let atual = ler();
const ouvintes = new Set<() => void>();

export function preferencias(): Preferencias { return atual; }
export function mudarPreferencias(p: Partial<Preferencias>): void {
  atual = { ...atual, ...p };
  try { localStorage.setItem(CHAVE, JSON.stringify(atual)); } catch { /* sem armazenamento: vale até fechar a página */ }
  for (const f of ouvintes) f();
}
export function usePreferencias(): Preferencias {
  const [, forcar] = useState(0);
  useEffect(() => { const f = () => forcar((x) => x + 1); ouvintes.add(f); return () => { ouvintes.delete(f); }; }, []);
  return atual;
}
