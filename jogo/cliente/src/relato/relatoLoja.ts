// Abre a janela de relato de erro de qualquer lugar (menu da mesa, botão das outras telas, aviso de erro do servidor).

import { useEffect, useState } from 'preact/hooks';
import type { TipoRelato } from '../../../servidor/protocolo.ts';

export interface PedidoAbertura {
  /** muda a cada abertura (a janela recomeça o print) */
  vez: number;
  tipo?: TipoRelato;
  /** texto para começar o "O que aconteceu?" (ex.: o aviso de erro que apareceu) */
  texto?: string;
}

let atual: PedidoAbertura | null = null;
let vez = 0;
const ouvintes = new Set<(p: PedidoAbertura | null) => void>();

function mudar(p: PedidoAbertura | null): void {
  atual = p;
  for (const f of ouvintes) f(p);
}

export function abrirRelato(o: { tipo?: TipoRelato; texto?: string } = {}): void {
  // já aberto: não recomeça (não perde o que a pessoa escreveu)
  if (atual) return;
  mudar({ vez: ++vez, ...o });
}

export function fecharRelato(): void { mudar(null); }

export function useRelato(): PedidoAbertura | null {
  const [p, setP] = useState(atual);
  useEffect(() => {
    ouvintes.add(setP);
    setP(atual);
    return () => { ouvintes.delete(setP); };
  }, []);
  return p;
}
