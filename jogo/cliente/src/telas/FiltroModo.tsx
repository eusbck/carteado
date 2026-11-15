// Filtro dos decks pelo modo de jogo (motor/modos.ts) na tela Decks. Aberta pelo saguão, a tela fica presa ao modo
// da sala (só aparecem os decks que dá para escolher ali); aberta pelo início, mostra os botões Todos / Commander /
// Standard, e a escolha fica guardada neste navegador.

import { useState } from 'preact/hooks';
import { LISTA_MODOS, ehModo, modoDe, type ModoJogo } from '../../../motor/modos.ts';

export type FiltroModo = 'todos' | ModoJogo;

const CHAVE = 'commander-da-mesa:filtro-modo';

function lido(): FiltroModo {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v === 'todos' || ehModo(v)) return v;
  } catch { /* sem armazenamento */ }
  return 'todos';
}

/** o filtro escolhido, guardado entre as visitas */
export function useFiltroModo(): [FiltroModo, (f: FiltroModo) => void] {
  const [f, setF] = useState<FiltroModo>(lido);
  return [f, (novo) => {
    setF(novo);
    try { localStorage.setItem(CHAVE, novo); } catch { /* vale até fechar a página */ }
  }];
}

export const passaNoModo = (f: FiltroModo, d: { formato?: ModoJogo | null }) => f === 'todos' || modoDe(d) === f;

/** botões do filtro, com quantos decks há em cada modo */
export function BotoesModo({ decks, valor, mudar }: { decks: { formato?: ModoJogo | null }[]; valor: FiltroModo; mudar: (f: FiltroModo) => void }) {
  const conta = (f: FiltroModo) => decks.filter((d) => passaNoModo(f, d)).length;
  const opcoes: [FiltroModo, string, string][] = [['todos', 'Todos os modos', 'Decks de todos os modos de jogo'],
    ...LISTA_MODOS.map((m): [FiltroModo, string, string] => [m.id, m.nome, m.descricao])];
  return (
    <div class="filtro-origem filtro-modo" role="group" aria-label="Filtrar decks pelo modo de jogo">
      {opcoes.map(([o, nome, dica]) => (
        <button key={o} type="button" class={`filtro-origem-op ${o}`} aria-pressed={valor === o} title={dica} onClick={() => mudar(o)}>
          {nome} <span class="filtro-origem-n">{conta(o)}</span>
        </button>
      ))}
    </div>
  );
}
