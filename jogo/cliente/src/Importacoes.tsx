// Selo das importações de deck fora da tela Decks: enquanto as suas importações andam, mostra o andamento; quando uma
// termina, mostra o resultado por uns segundos (ele fica também na lista da tela Decks). Três lugares:
//   canto    início e saguão, no canto de baixo à esquerda; um clique abre a tela Decks
//   lateral  na mesa, na barra lateral acima do chat (o canto da mesa tem o Comando, os terrenos e a mão)
//   coluna   na mesa com a barra recolhida, na coluna de avisos da direita
// Na mesa o selo só informa.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { TarefaPublica } from '../../servidor/protocolo.ts';
import { loja, useLoja } from './loja.ts';

/** quanto tempo o resultado de uma importação fica no selo */
const TEMPO_AVISO = 10_000;

interface Aviso { id: number; texto: string; classe: string }

/** o nome do deck sem o "(... Commander Precon Decklist)" do Moxfield (que o corte em 60 caracteres às vezes deixa
 * pela metade) */
export function nomeCurto(t: TarefaPublica): string {
  const nome = t.nome ?? t.proposta?.nome ?? t.deck ?? 'deck';
  return nome.replace(/\s*\([^()]*\)?\s*$/, '').trim() || nome;
}

/** como a importação terminou, sem repetir o nome do deck: "Em preparação: faltam regras para 56 cartas." */
export function desfecho(t: TarefaPublica): string {
  if (t.estado === 'erro') return t.erro ?? 'Erro na importação.';
  const p = t.proposta;
  const r = t.resultado;
  if (!r) {
    if (p?.erros.length) return 'A lista não cumpre as regras de deck do Commander.';
    return p?.destino === 'nada' ? p.resumo : 'Prévia pronta: veja o que muda antes de aplicar.';
  }
  if (r.destino === 'nada' || !p) return r.texto;
  const n = p.total - p.prontas;
  const cartas = n === 1 ? '1 carta' : `${n} cartas`;
  if (r.destino === 'jogavel') return p.novo ? 'Entrou no saguão.' : 'Atualizado.';
  return p.novo ? `Em preparação: faltam regras para ${cartas}.` : `Atualização guardada: faltam regras para ${cartas}.`;
}

/** o que dizer quando uma importação sua termina */
function aviso(t: TarefaPublica): Aviso {
  const classe = t.estado === 'erro' || t.proposta?.erros.length ? 'erro' : t.resultado?.destino === 'jogavel' ? 'jogavel' : '';
  return { id: t.id, texto: `${nomeCurto(t)}: ${desfecho(t)}`, classe };
}

export function Importacoes({ lugar }: { lugar: 'canto' | 'lateral' | 'coluna' }) {
  const e = useLoja();
  const minhas = e.minhasTarefas.map((id) => e.tarefasDeck[id]).filter((t): t is TarefaPublica => !!t);
  const andando = minhas.filter((t) => t.estado === 'andando');
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  // o último estado visto de cada uma: o aviso sai só na passagem de "andando" para pronta ou erro
  const vistos = useRef(new Map<number, TarefaPublica['estado']>());
  const relogios = useRef<number[]>([]);

  useEffect(() => {
    for (const t of minhas) {
      if (vistos.current.get(t.id) === 'andando' && t.estado !== 'andando') {
        const a = aviso(t);
        setAvisos((l) => [...l.filter((x) => x.id !== a.id), a]);
        relogios.current.push(window.setTimeout(() => setAvisos((l) => l.filter((x) => x.id !== a.id)), TEMPO_AVISO));
      }
      vistos.current.set(t.id, t.estado);
    }
  }, [e.tarefasDeck, e.minhasTarefas]);
  useEffect(() => () => relogios.current.forEach((r) => clearTimeout(r)), []);

  if (!andando.length && !avisos.length) return null;
  const um = andando.length === 1 ? andando[0] : null;
  // a conta fica fora do texto que corta: o nome comprido nunca esconde o "23/59"
  const conteudo = andando.length > 0 && (
    <>
      <span class="selo-linha">
        <span class="selo-roda" aria-hidden="true" />
        <span class="selo-texto">{um ? `Importando ${nomeCurto(um)}` : `Importando ${andando.length} decks`}</span>
        {um && um.total > 0 && <span class="selo-conta">{um.feito}/{um.total}</span>}
      </span>
      {um && um.total > 0 && <span class="cat-barra"><span style={{ width: `${Math.round((100 * um.feito) / um.total)}%` }} /></span>}
    </>
  );
  // fora da mesa os itens são botões que abrem a tela Decks
  const naMesa = lugar !== 'canto';
  const Item = naMesa ? 'div' : 'button';
  const abrir = naMesa ? undefined : () => void loja.abrirDecks();
  const titulo = naMesa ? undefined : 'Abrir a tela Decks';
  return (
    <div class={`selo-importacoes ${lugar}`} role="status" aria-live="polite">
      {avisos.map((a) => (
        <Item key={a.id} type={naMesa ? undefined : 'button'} class={a.classe} onClick={abrir} title={titulo}>
          <span class="selo-aviso">{a.texto}</span>
        </Item>
      ))}
      {conteudo && <Item type={naMesa ? undefined : 'button'} onClick={abrir} title={titulo}>{conteudo}</Item>}
    </div>
  );
}
