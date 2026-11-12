// Filtro dos decks pela origem (servidor/catalogo/origem.ts): precons à venda iguais ao produto, precons com cartas
// trocadas, listas montadas por alguém e decks criados aqui. Usado no passo dos decks do saguão e na tela Decks; a
// escolha fica guardada neste navegador.

import { useState } from 'preact/hooks';
import type { OrigemPublica } from '../../../servidor/protocolo.ts';

export type FiltroOrigem = 'todos' | OrigemPublica['tipo'];

const OPCOES: [FiltroOrigem, string, string][] = [
  ['todos', 'Todos', 'Todos os decks'],
  ['precon', 'Precons', 'Iguais ao deck pré-montado que se compra na loja'],
  ['modificado', 'Precons modificados', 'Um precon com algumas cartas trocadas'],
  ['montado', 'Montados', 'Listas montadas por alguém (link do Moxfield)'],
  ['casa', 'Criados aqui', 'Decks com cartas inventadas pela mesa'],
];

const CHAVE = 'commander-da-mesa:filtro-origem';

function lido(): FiltroOrigem {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v && OPCOES.some(([o]) => o === v)) return v as FiltroOrigem;
  } catch { /* sem armazenamento */ }
  return 'todos';
}

/** o filtro escolhido, guardado entre as telas e as visitas */
export function useFiltroOrigem(): [FiltroOrigem, (f: FiltroOrigem) => void] {
  const [f, setF] = useState<FiltroOrigem>(lido);
  return [f, (novo) => {
    setF(novo);
    try { localStorage.setItem(CHAVE, novo); } catch { /* vale até fechar a página */ }
  }];
}

/** sem origem (servidor antigo) o deck conta como montado */
export const tipoDe = (d: { origem?: OrigemPublica }) => d.origem?.tipo ?? 'montado';

export const passaNoFiltro = (f: FiltroOrigem, d: { origem?: OrigemPublica }) => f === 'todos' || tipoDe(d) === f;

/** botões do filtro, com quantos decks há em cada um (os vazios somem) */
export function BotoesOrigem({ decks, valor, mudar }: { decks: { origem?: OrigemPublica }[]; valor: FiltroOrigem; mudar: (f: FiltroOrigem) => void }) {
  const conta = (f: FiltroOrigem) => decks.filter((d) => passaNoFiltro(f, d)).length;
  return (
    <div class="filtro-origem" role="group" aria-label="Filtrar decks pela origem">
      {OPCOES.filter(([o]) => o === 'todos' || o === valor || conta(o) > 0).map(([o, nome, dica]) => (
        <button key={o} type="button" class={`filtro-origem-op ${o}`} aria-pressed={valor === o} title={dica} onClick={() => mudar(o)}>
          {nome} <span class="filtro-origem-n">{conta(o)}</span>
        </button>
      ))}
    </div>
  );
}

const ROTULO: Record<OrigemPublica['tipo'], string> = { precon: 'Precon', modificado: 'Precon modificado', montado: 'Montado', casa: 'Criado aqui' };

/** a linha pequena acima do nome do deck: "Precon", "Precon · 4 trocas"… (o produto aparece ao passar o mouse) */
export function SeloOrigem({ origem }: { origem?: OrigemPublica }) {
  if (!origem) return null;
  const texto = origem.tipo === 'modificado' && origem.trocas ? `Precon · ${origem.trocas} ${origem.trocas === 1 ? 'troca' : 'trocas'}` : ROTULO[origem.tipo];
  const dica = origem.produto
    ? origem.tipo === 'precon' ? `Precon ${origem.produto}, igual ao da loja` : `Baseado no precon ${origem.produto}, com ${origem.trocas} carta(s) trocada(s)`
    : origem.tipo === 'casa' ? 'Deck com cartas criadas pela mesa' : 'Lista montada por alguém';
  return <span class={`deck-origem ${origem.tipo}`} title={dica}>{texto}</span>;
}
