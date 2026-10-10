// Registro da partida, numa janela como as outras do menu (Paradas, Configurações): o que aconteceu,
// separado por turno, com a regra (CR) de cada linha e uma busca. Atualiza com a janela aberta e
// acompanha o fim enquanto você não sobe para ler.

import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { GameView } from '../../../motor/view.ts';
import { traduzir } from '../cartas.ts';
import { Janela } from '../Janela.tsx';

/** quantas linhas a vista traz (motor/view.ts) */
const LINHAS_DA_VISTA = 200;

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

interface Linha { id: number; texto: string; regra?: string; manual: boolean; quem: number | null }

type EntradaLog = GameView['log'][number];
interface Numeracao { log: EntradaLog[]; ids: number[]; prox: number }
const mesma = (a: EntradaLog, b: EntradaLog) => a.turn === b.turn && a.text === b.text && a.rule === b.rule;

/**
 * Um número fixo para cada linha, para servir de chave: a vista traz só as últimas linhas, então a lista anda (as de
 * cima saem, as novas entram embaixo) e a chave pela posição fazia cada linha receber o texto da vizinha (todas
 * redesenhavam a cada linha nova). As linhas que continuam guardam o número; as novas ganham os seguintes.
 */
function numerar(antes: Numeracao | null, log: EntradaLog[]): Numeracao {
  if (!antes) return { log, ids: log.map((_, i) => i), prox: log.length };
  if (antes.log === log) return antes;
  const a = antes.log;
  // quantas saíram do começo: o menor k em que o resto da lista anterior é o começo da nova (k = tudo sempre serve)
  for (let k = 0; ; k++) {
    const n = Math.min(a.length - k, log.length);
    let i = 0;
    while (i < n && mesma(a[k + i], log[i])) i++;
    if (i === n) return { log, ids: log.map((_, j) => (j < n ? antes.ids[k + j] : antes.prox + j - n)), prox: antes.prox + log.length - n };
  }
}

export function Registro({ v, cor, fechar }: { v: GameView; cor: (p: number) => string; fechar: () => void }) {
  const [busca, setBusca] = useState('');
  const lista = useRef<HTMLDivElement>(null);
  const noFim = useRef(true);

  const numeracao = useRef<Numeracao | null>(null);
  const ids = useMemo(() => (numeracao.current = numerar(numeracao.current, v.log)).ids, [v.log]);
  const turnos = useMemo(() => {
    const termo = normalizar(busca.trim());
    const grupos: { chave: string; turno: number; rodada: number; vez: string | null; linhas: Linha[] }[] = [];
    const vezes = new Map<number, number>();
    v.log.forEach((l, k) => {
      // a mesa conta rodadas: a linha "Turno N: Fulano." (o turno de cada jogador, CR 500.1) vira o começo da vez dele
      // (o texto do motor fica igual: o desfazer do servidor procura por ele)
      const inicio = /^Turno \d+: (.+)\.$/.exec(l.text);
      const rodada = l.round ?? Math.max(1, Math.ceil(l.turn / Math.max(1, v.players.length)));
      const texto = inicio ? `Começa a vez de ${inicio[1]} (rodada ${rodada}).` : traduzir(l.text);
      if (termo && !normalizar(`${texto} ${l.rule ?? ''}`).includes(termo)) return;
      const quem = v.players.find((p) => texto.startsWith(`${p.name} `) || texto.startsWith(`${p.name}:`))?.id ?? null;
      const linha: Linha = { id: ids[k], texto, regra: l.rule, manual: l.text.includes('(ajuste manual)'), quem };
      const ultimo = grupos[grupos.length - 1];
      if (ultimo?.turno === l.turn) { ultimo.linhas.push(linha); if (inicio) ultimo.vez = inicio[1]; return; }
      // um bloco por turno de jogador, com a rodada no título (um turno que aparece de novo mais adiante ganha um sufixo)
      const n = vezes.get(l.turn) ?? 0;
      vezes.set(l.turn, n + 1);
      grupos.push({ chave: n ? `${l.turn}-${n}` : String(l.turn), turno: l.turn, rodada, vez: inicio?.[1] ?? (l.turn === v.turn.number ? v.players[v.turn.active]?.name ?? null : null), linhas: [linha] });
    });
    return grupos;
  }, [v.log, v.players, busca, ids]);
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
            <h3>{t.turno === 0 ? 'Antes da 1ª rodada' : `Rodada ${t.rodada}${t.vez ? ` · vez de ${t.vez}` : ''}`}</h3>
            <ol>
              {t.linhas.map((l) => {
                const nome = l.quem !== null ? v.players[l.quem].name : null;
                return (
                  <li key={l.id} class={l.manual ? 'manual' : ''}>
                    {nome ? <><b style={{ color: cor(l.quem!) }}>{nome}</b>{l.texto.slice(nome.length)}</> : l.texto}
                    {l.regra && <span class="regra"> (CR {l.regra})</span>}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </Janela>
  );
}
