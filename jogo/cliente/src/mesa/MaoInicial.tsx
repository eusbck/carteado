// Tela da mão inicial (antes do primeiro turno): as sete cartas em leque, manter ou fazer
// mulligan, e no mulligan de Londres a escolha das cartas que vão para o fundo do grimório.

import { useLayoutEffect, useState } from 'preact/hooks';
import { MULLIGANS_LIVRES, type Decision } from '../../../motor/types.ts';
import type { GameView } from '../../../motor/view.ts';
import type { RegraMulligan } from '../../../servidor/protocolo.ts';
import { loja } from '../loja.ts';
import { Carta } from './Carta.tsx';

interface Props {
  v: GameView;
  d: Decision | null;
  enviando: boolean;
  regra: RegraMulligan;
  multiplayer: boolean;
  sel: string[];
  setSel: (s: string[]) => void;
}

/** a largura da mesa, medida depois de desenhar e de novo quando ela muda (janela do navegador, barra recolhida); antes
 * era lida no meio do desenho (layout forçado a cada vez) e não acompanhava a janela */
function useLarguraMesa(): number {
  const [largura, setLargura] = useState(() => innerWidth);
  useLayoutEffect(() => {
    const mesa = document.querySelector<HTMLElement>('.tabuleiro');
    if (!mesa) return;
    const ler = () => setLargura(mesa.clientWidth);
    ler();
    const ro = new ResizeObserver(ler);
    ro.observe(mesa);
    return () => ro.disconnect();
  }, []);
  return largura;
}

export function MaoInicial({ v, d, enviando, regra, multiplayer, sel, setSel }: Props) {
  const eu = v.you!;
  const minha = v.players[eu];
  const mao = v.hand;
  const fundo = d?.kind === 'select' ? d : null;
  const decidindo = d?.kind === 'mulligan' && !enviando;
  const n = mao.length;
  const meio = (n - 1) / 2;
  // o leque cabe na largura da mesa (as cartas giradas abrem um pouco mais nas pontas)
  const largura = useLarguraMesa();
  const passo = n > 1 ? Math.max(40, Math.min(122, (largura - 440) / (n - 1))) : 0;

  const alternar = (id: string) => {
    if (!fundo) return;
    if (sel.includes(id)) setSel(sel.filter((x) => x !== id));
    else if (sel.length < fundo.max) setSel([...sel, id]);
  };

  let sub: string;
  if (fundo) sub = `Clique nas cartas que vão para o fundo do grimório${fundo.min > 1 ? ' (a primeira escolhida fica mais em cima)' : ''}.`;
  else if (regra === 'livre') sub = `Regra da mesa: Livre · troca a mão inteira, até ${MULLIGANS_LIVRES} vezes (você já usou ${minha.mulligans})`;
  else sub = `Regra da mesa: Londres · ${multiplayer ? 'o primeiro mulligan é grátis' : 'cada mulligan põe uma carta no fundo'}${minha.mulligans ? ` · você já fez ${minha.mulligans}` : ''}`;
  const esperando = !d && v.waiting ? v.players[v.waiting.player]?.name : null;

  return (
    <div class="escurecer" role="dialog" aria-label="Mão inicial">
      <div class="tela-mulligan">
        {fundo
          ? <h1 class="titulo-tela">Escolha <span>{fundo.min}</span> carta{fundo.min > 1 ? 's' : ''} para o fundo</h1>
          : <h1 class="titulo-tela">Mão inicial <span>({n})</span></h1>}
        <p class="sub">{sub}</p>
        <div class="leque">
          {mao.map((o, i) => {
            const id = String(o.id);
            const marcada = sel.includes(id);
            return (
              <Carta key={o.id} o={o} classe={marcada ? 'fundo' : ''} onClick={fundo ? () => alternar(id) : undefined}
                estilo={{ left: `calc(50% + ${Math.round((i - meio) * passo)}px)`, top: `${Math.round(18 + (i - meio) ** 2 * 4)}px`, '--r': `${((i - meio) * 4).toFixed(1)}deg`, zIndex: i + 1 }} />
            );
          })}
        </div>
        <div class="botoes-linha centro-linha">
          {decidindo && (<>
            <button class="botao amarelo grande" onClick={() => loja.responder(d!.id, { kind: 'mulligan', keep: false })}>Mulligan</button>
            <button class="botao principal grande" onClick={() => loja.responder(d!.id, { kind: 'mulligan', keep: true })}>Manter</button>
          </>)}
          {fundo && !enviando && (
            <button class="botao principal grande" disabled={sel.length < fundo.min || sel.length > fundo.max} onClick={() => loja.responder(fundo.id, { kind: 'select', ids: sel })}>Confirmar</button>
          )}
          {enviando && <span class="sub">Enviando…</span>}
          {esperando && <span class="sub">Esperando {esperando} decidir a mão…</span>}
        </div>
      </div>
    </div>
  );
}
