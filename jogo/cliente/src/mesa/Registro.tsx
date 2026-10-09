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

interface Linha { texto: string; regra?: string; manual: boolean; quem: number | null }

export function Registro({ v, cor, fechar }: { v: GameView; cor: (p: number) => string; fechar: () => void }) {
  const [busca, setBusca] = useState('');
  const lista = useRef<HTMLDivElement>(null);
  const noFim = useRef(true);

  const turnos = useMemo(() => {
    const termo = normalizar(busca.trim());
    const grupos: { turno: number; linhas: Linha[] }[] = [];
    for (const l of v.log) {
      const texto = traduzir(l.text);
      if (termo && !normalizar(`${texto} ${l.rule ?? ''}`).includes(termo)) continue;
      const quem = v.players.find((p) => texto.startsWith(`${p.name} `) || texto.startsWith(`${p.name}:`))?.id ?? null;
      const linha: Linha = { texto, regra: l.rule, manual: l.text.includes('(ajuste manual)'), quem };
      const ultimo = grupos[grupos.length - 1];
      if (ultimo?.turno === l.turn) ultimo.linhas.push(linha);
      else grupos.push({ turno: l.turn, linhas: [linha] });
    }
    return grupos;
  }, [v.log, v.players, busca]);
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
        {turnos.map((t, k) => (
          <section key={`${t.turno}-${k}`} class="registro-turno-bloco">
            <h3>{t.turno === 0 ? 'Antes do 1º turno' : `Turno ${t.turno}`}</h3>
            <ol>
              {t.linhas.map((l, i) => {
                const nome = l.quem !== null ? v.players[l.quem].name : null;
                return (
                  <li key={i} class={l.manual ? 'manual' : ''}>
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
