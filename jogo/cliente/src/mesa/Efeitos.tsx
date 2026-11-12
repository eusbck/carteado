// Efeitos que todos veem: o ataque declarado (investida), o dano de combate (golpe: a carta recua, dispara, congela no
// impacto; clarão, onda, risco, lascas e o tranco da mesa), dano e vida (números, tremida e brilho na vida), criaturas
// que saem do campo voando para o cemitério ou o exílio, e os sons de cada coisa. Tudo sai da diferença entre uma vista
// e a seguinte, então vale também para as jogadas dos outros. O plano do combate é golpes.ts; a tela, impacto.ts (com as
// regras de desempenho: só transform e opacity animam, tudo agendado de uma vez numa camada que não treme).

import { useLayoutEffect, useRef } from 'preact/hooks';
import type { GameView } from '../../../motor/view.ts';
import { abafarMusica } from '../musica.ts';
import { preferencias } from '../preferencias.ts';
import { somDaTroca } from '../somTurno.ts';
import { tocar, tocarDesvirar } from '../sons.ts';
import { informarDuracao, vistasSemAnimacao } from './cenaLoja.ts';
import { planejarCombate, type PlanoCombate } from './golpes.ts';
import { efeitosDaVista, fotografar, type Foto } from './impacto.ts';
import './efeitos.css';

/** as cartas do campo deslizam para o lugar novo e giram ao virar (estilo.css: left/top .25s, rotate .22s) */
const ARRUMACAO_MS = 280;

/** o campo mudou: entrou ou saiu permanente, ou alguma virou ou desvirou (a arrumação anda) */
function campoMudou(a: GameView, v: GameView): boolean {
  if (a.battlefield === v.battlefield) return false;
  if (a.battlefield.length !== v.battlefield.length) return true;
  const antes = new Map(a.battlefield.map((o) => [o.id, o.tapped]));
  return v.battlefield.some((o) => antes.get(o.id) !== o.tapped);
}

/** quanto as animações de efeitosDaVista duram, para uma versão de impacto.ts que ainda não devolve o número (pelas
 * constantes de lá, por cima); o teto da fila (TETO_QUADRO) segura o resto */
function estimarEfeitos(a: GameView, v: GameView, plano: PlanoCombate): number {
  if (plano.golpes.length) return 1200;
  const vidaMudou = v.players.some((p, i) => p.life !== a.players[i]?.life);
  const saiu = a.battlefield.some((o) => !v.battlefield.some((x) => x.id === o.id));
  if (saiu || vidaMudou) return 1000;
  if (plano.declarados.length) return 770;
  return 0;
}

/** N7: intervalo entre uma permanente e a seguinte no desvirar em onda, o giro de cada uma e o teto da onda */
const ONDA_PASSO = 25, ONDA_GIRO = 220, ONDA_MAX = 40;

/**
 * As permanentes que desviraram juntas (o começo do turno) giram em onda, ONDA_PASSO uma depois da outra, por área, de
 * cima para baixo e da esquerda para a direita (a posição escrita no estilo pela arrumação, sem medir). O giro sai da
 * transição de rotate de estilo.css (que já pode ter começado: os filhos medem antes) para uma animação com atraso que
 * segura a carta virada até a vez dela (fill backwards); a transição das outras propriedades fica. Devolve quanto a onda
 * dura (0: nada).
 */
function desvirarEmOnda(a: GameView, v: GameView): number {
  if (a.battlefield === v.battlefield) return 0;
  const virada = new Map(a.battlefield.map((o) => [o.id, o.tapped]));
  const ids = v.battlefield.filter((o) => !o.tapped && virada.get(o.id) === true).map((o) => o.id);
  if (ids.length < 2) return 0;
  const els = ids.map((id) => document.querySelector<HTMLElement>(`.campo [data-obj="${id}"]`)).filter((el): el is HTMLElement => !!el && typeof el.animate === 'function');
  const chave = (el: HTMLElement) => [Number(el.closest('[data-jogador]')?.getAttribute('data-jogador') ?? 0), Math.round((parseFloat(el.style.top) || 0) / 40), parseFloat(el.style.left) || 0];
  const ordem = els.map((el) => ({ el, k: chave(el) })).sort((x, y) => x.k[0] - y.k[0] || x.k[1] - y.k[1] || x.k[2] - y.k[2]);
  ordem.forEach(({ el }, i) => {
    // o terreno deitado virado fica inclinado 7° (estilo.css, .deitada-virada); a carta em pé, 90°
    const de = el.classList.contains('deitada') ? (el.classList.contains('no-leque') ? '0deg' : '7deg') : '90deg';
    el.style.transitionProperty = 'translate, scale, box-shadow, left, top';
    const an = el.animate([{ rotate: de }, {}], { duration: ONDA_GIRO, delay: Math.min(i, ONDA_MAX) * ONDA_PASSO, easing: 'ease', fill: 'backwards' });
    const fim = () => { el.style.transitionProperty = ''; };
    an.onfinish = fim;
    an.oncancel = fim;
  });
  return Math.min(ordem.length - 1, ONDA_MAX) * ONDA_PASSO + ONDA_GIRO;
}

const movimentoReduzido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Liga os efeitos e os sons à vista da partida. `efeitos` desliga só a parte visual (os sons têm
 * as próprias chaves); "reduzir movimento" do sistema tira tremidas e deslocamentos.
 */
export function useEfeitos(v: GameView, eu: number, efeitos: boolean): void {
  const anterior = useRef<GameView | null>(null);
  /** onde estava cada criatura na vista de antes (a que sair voa dali; o atacante que morreu golpeia dali) */
  const fotos = useRef(new Map<number, Foto>());
  /** a última vista sem animação vista aqui (cenaLoja.vistaSemAnimacao: conectar, partida nova, desfazer) */
  const saltos = useRef(vistasSemAnimacao());

  useLayoutEffect(() => {
    const a = anterior.current;
    anterior.current = v;
    // as permanentes e o topo da pilha, só com os efeitos visuais ligados: medir todas as cartas a cada mensagem forçava o layout da
    // mesa inteira mesmo quando nenhum efeito ia rodar
    const fotografarSeLigado = () => (efeitos && !document.hidden ? fotografar(v) : new Map<number, Foto>());
    // a vista que não continua a anterior (protocolo-2: reinício) entra sem efeitos nem sons: a diferença não é jogada
    const salto = saltos.current !== vistasSemAnimacao();
    saltos.current = vistasSemAnimacao();
    if (!a || a === v || salto) { fotos.current = fotografarSeLigado(); informarDuracao(0); return; }

    // troca de turno: o som do seu turno ou o de adversário, decidido pelo assento deste navegador
    const somTurno = somDaTroca(a.turn, v.turn, eu, preferencias().sons);
    if (somTurno) tocar(somTurno === 'meu' ? 'turnoMeu' : 'turnoAdversario');
    // o aviso do seu turno passa por cima da música: ela abaixa por um instante
    if (somTurno === 'meu' && preferencias().volume > 0) abafarMusica();

    // a onda do desvirar antes de qualquer medida (Desempenho, "reduzir movimento" e efeitos desligados: o giro de sempre)
    const onda = efeitos && !document.hidden && !preferencias().desempenho && !movimentoReduzido() ? desvirarEmOnda(a, v) : 0;
    // um som só para a onda inteira (N7)
    if (onda > 0) tocarDesvirar(onda);

    const plano = planejarCombate(a, v);
    const antes = fotos.current;
    // as fotos desta vista são lidas junto com as medidas dos efeitos, antes de qualquer elemento novo (um layout só)
    fotos.current = fotografarSeLigado();
    // contrato com impacto.ts: efeitosDaVista devolve os ms até a última animação deste quadro acabar (0: nada a
    // esperar); a fila de quadros (filaQuadros.ts) só passa ao seguinte, e a decisão só aparece, depois disso (com
    // teto). Uma versão que ainda não devolve o número cai na estimativa pelas constantes
    const ms: unknown = efeitosDaVista(a, v, plano, antes, { eu, reduzir: movimentoReduzido(), leve: preferencias().desempenho, efeitos });
    const animacoes = typeof ms === 'number' ? ms : efeitos && !document.hidden ? estimarEfeitos(a, v, plano) : 0;
    informarDuracao(Math.max(animacoes, onda, campoMudou(a, v) ? ARRUMACAO_MS : 0));
  }, [v]);
}
