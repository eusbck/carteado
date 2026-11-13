// Registro da partida, numa janela como as outras do menu (Paradas, Configurações): o que aconteceu,
// separado por turno, com a regra (CR) de cada linha e uma busca. Atualiza com a janela aberta e
// acompanha o fim enquanto você não sobe para ler.

import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { GameView, LogLinhaView } from '../../../motor/view.ts';
import { nomeDaRef, textoDaLinha, traduzir } from '../cartas.ts';
import { Janela } from '../Janela.tsx';

/** quantas linhas a vista traz (motor/view.ts) */
const LINHAS_DA_VISTA = 200;

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

type Jogadores = GameView['players'];

/** o mesmo texto em pedaços para desenhar: o nome de cada jogador citado vai em negrito na cor dele */
function pedacosDaLinha(l: LogLinhaView, jogadores: Jogadores, cor: (p: number) => string): ComponentChildren {
  if (!l.parts?.length || !l.refs) {
    // sem partes: o autor (pelo `actor`, não pelo começo do texto) em destaque, se o texto começa por ele
    const texto = traduzir(l.text);
    const nome = l.actor != null ? jogadores[l.actor]?.name : undefined;
    if (nome && (texto.startsWith(`${nome} `) || texto.startsWith(`${nome}:`))) return <><b style={{ color: cor(l.actor!) }}>{nome}</b>{texto.slice(nome.length)}</>;
    return texto;
  }
  return l.parts.map((p) => {
    if (typeof p === 'string') return traduzir(p);
    const r = l.refs![p.ref];
    if (!r) return null;
    return r.k === 'jogador' ? <b style={{ color: cor(r.id) }}>{nomeDaRef(r, jogadores)}</b> : nomeDaRef(r, jogadores);
  });
}

interface Linha { id: number; texto: string; conteudo: ComponentChildren; regra?: string; manual: boolean }

export function Registro({ v, cor, fechar }: { v: GameView; cor: (p: number) => string; fechar: () => void }) {
  const [busca, setBusca] = useState('');
  const lista = useRef<HTMLDivElement>(null);
  const noFim = useRef(true);

  const turnos = useMemo(() => {
    const termo = normalizar(busca.trim());
    const grupos: { chave: string; turno: number; rodada: number; vez: number | null; linhas: Linha[] }[] = [];
    const vezes = new Map<number, number>();
    // de quem é cada turno, pela linha de começo de turno (antes do filtro da busca, que pode escondê-la). Linhas
    // antigas não têm o tipo: o turno fica sem dono, menos o que está em andamento
    const vezDe = new Map<number, number>();
    for (const l of v.log) if (l.kind === 'turno' && l.actor != null) vezDe.set(l.turn, l.actor);
    for (const l of v.log) {
      const rodada = l.round ?? Math.max(1, Math.ceil(l.turn / Math.max(1, v.players.length)));
      let texto: string;
      let conteudo: ComponentChildren;
      if (l.kind === 'turno' && l.actor != null && v.players[l.actor]) {
        // a mesa conta rodadas: o começo do turno de cada jogador (CR 500.1) vira o começo da vez dele
        const nome = v.players[l.actor].name;
        texto = `Começa a vez de ${nome} (rodada ${rodada}).`;
        conteudo = <>Começa a vez de <b style={{ color: cor(l.actor) }}>{nome}</b> (rodada {rodada}).</>;
      } else {
        texto = textoDaLinha(l, v.players);
        conteudo = pedacosDaLinha(l, v.players, cor);
      }
      if (termo && !normalizar(`${texto} ${l.rule ?? ''}`).includes(termo)) continue;
      const linha: Linha = { id: l.seq, texto, conteudo, regra: l.rule, manual: l.kind === 'manual' };
      const ultimo = grupos[grupos.length - 1];
      if (ultimo?.turno === l.turn) { ultimo.linhas.push(linha); continue; }
      // um bloco por turno de jogador, com a rodada no título (um turno que aparece de novo mais adiante ganha um sufixo)
      const n = vezes.get(l.turn) ?? 0;
      vezes.set(l.turn, n + 1);
      grupos.push({ chave: n ? `${l.turn}-${n}` : String(l.turn), turno: l.turn, rodada, vez: vezDe.get(l.turn) ?? (l.turn === v.turn.number ? v.turn.active : null), linhas: [linha] });
    }
    return grupos;
  }, [v.log, v.players, busca, cor]);
  const total = turnos.reduce((n, t) => n + t.linhas.length, 0);

  // abre no fim; com linhas novas, continua no fim se você estava lá
  useLayoutEffect(() => {
    const el = lista.current;
    if (el && noFim.current) el.scrollTop = el.scrollHeight;
  }, [v.log.length, busca]);
  const rolou = () => {
    const el = lista.current;
    if (el) noFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
  };

  return (
    <Janela titulo="Registro da partida" classe="registro-janela" fechar={fechar}>
      <div class="registro-busca">
        <input type="search" value={busca} placeholder="Procurar (carta, jogador, regra…)" aria-label="Procurar no registro"
          onInput={(ev) => { noFim.current = true; setBusca((ev.target as HTMLInputElement).value); }} />
        {busca.trim() && <span class="suave">{total === 1 ? '1 linha' : `${total} linhas`}</span>}
      </div>
      <div class="registro-lista" ref={lista} onScroll={rolou}>
        {v.log.length >= LINHAS_DA_VISTA && !busca.trim() && <p class="suave registro-nota">Mostrando as últimas {LINHAS_DA_VISTA} linhas da partida.</p>}
        {total === 0 && <p class="suave">{busca.trim() ? 'Nada encontrado.' : 'Nada aconteceu ainda.'}</p>}
        {turnos.map((t) => (
          <section key={t.chave} class="registro-turno-bloco">
            <h3>{t.turno === 0 ? 'Antes da 1ª rodada' : `Rodada ${t.rodada}${t.vez !== null && v.players[t.vez] ? ` · vez de ${v.players[t.vez].name}` : ''}`}</h3>
            <ol>
              {t.linhas.map((l) => (
                <li key={l.id} class={l.manual ? 'manual' : ''}>
                  {l.conteudo}
                  {l.regra && <span class="regra"> (CR {l.regra})</span>}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </Janela>
  );
}
