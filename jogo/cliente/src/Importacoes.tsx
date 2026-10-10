// Selo das importações de deck fora da tela Decks (início, saguão e mesa): enquanto as suas importações andam, mostra
// o andamento; quando uma termina, mostra o resultado por uns segundos (ele fica também na lista da tela Decks). Fora da
// mesa, um clique abre a tela Decks; na mesa o selo só informa e não pega cliques.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { TarefaPublica } from '../../servidor/protocolo.ts';
import { loja, useLoja } from './loja.ts';

/** quanto tempo o resultado de uma importação fica no selo */
const TEMPO_AVISO = 10_000;

interface Aviso { id: number; texto: string; classe: string }

const nomeDa = (t: TarefaPublica) => t.nome ?? t.proposta?.nome ?? t.deck ?? 'deck';

/** o que dizer quando uma importação sua termina */
function aviso(t: TarefaPublica): Aviso {
  if (t.estado === 'erro') return { id: t.id, texto: `${nomeDa(t)}: ${t.erro ?? 'erro na importação'}`, classe: 'erro' };
  if (t.resultado) return { id: t.id, texto: t.resultado.texto, classe: t.resultado.destino === 'jogavel' ? 'jogavel' : '' };
  if (t.proposta?.erros.length) return { id: t.id, texto: `${nomeDa(t)} não cumpre as regras de deck: veja na tela Decks.`, classe: 'erro' };
  return { id: t.id, texto: `A prévia de ${nomeDa(t)} está pronta na tela Decks.`, classe: '' };
}

export function Importacoes({ naMesa }: { naMesa: boolean }) {
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
  const conteudo = andando.length > 0 && (
    <>
      <span class="selo-linha">
        <span class="selo-roda" aria-hidden="true" />
        <span>{um ? `Importando ${nomeDa(um)}…${um.total ? ` ${um.feito} de ${um.total}` : ''}` : `Importando ${andando.length} decks…`}</span>
      </span>
      {um && um.total > 0 && <span class="cat-barra"><span style={{ width: `${Math.round((100 * um.feito) / um.total)}%` }} /></span>}
    </>
  );
  // fora da mesa os itens são botões que abrem a tela Decks
  const Item = naMesa ? 'div' : 'button';
  const abrir = naMesa ? undefined : () => void loja.abrirDecks();
  return (
    <div class={`selo-importacoes ${naMesa ? 'na-mesa' : ''}`} role="status" aria-live="polite">
      {avisos.map((a) => (
        <Item key={a.id} type={naMesa ? undefined : 'button'} class={a.classe} onClick={abrir} title={naMesa ? undefined : 'Abrir a tela Decks'}>
          <span class="selo-linha"><span>{a.texto}</span></span>
        </Item>
      ))}
      {conteudo && <Item type={naMesa ? undefined : 'button'} onClick={abrir} title={naMesa ? undefined : 'Abrir a tela Decks'}>{conteudo}</Item>}
    </div>
  );
}
