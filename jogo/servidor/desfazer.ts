// Desfazer com aceite da mesa: acha a última jogada de uma pessoa no turno, refaz a partida até
// antes dela (pelas entradas gravadas, sem mexer nas regras do motor) e descreve o que volta.

import { Game, type Checkpoint, type Input } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { GameConfig, PlayerId } from '../motor/types.ts';
import type { LinhaDesfeita } from './protocolo.ts';

/** de cada entrada: em que turno aconteceu e se foi a pessoa (não o passe automático nem um bot) */
export interface MetaEntrada {
  turno: number;
  humana: boolean;
}

/** respostas que começam uma jogada; as que vêm logo depois (alvos, pagamento…) fazem parte dela */
const INICIO_DE_JOGADA = new Set(['priority', 'attackers', 'blockers']);

/**
 * Posição da entrada onde começa a última jogada da pessoa neste turno, ou null se não há o que
 * desfazer. Conta tudo o que ela fez, inclusive passar a prioridade; os passes automáticos não.
 */
export function alvoDesfazer(inputs: Input[], metas: (MetaEntrada | null)[], jogador: PlayerId, turnoAtual: number): number | null {
  if (turnoAtual < 1) return null; // nada antes do primeiro turno (mão inicial)
  const dela = (k: number) => {
    const inp = inputs[k], m = metas[k];
    return inp.t === 'a' && inp.p === jogador && !!m?.humana && m.turno === turnoAtual;
  };
  let i = inputs.length - 1;
  for (; i >= 0; i--) {
    const m = metas[i];
    if (!m || m.turno !== turnoAtual) return null;
    if (dela(i)) break;
  }
  if (i < 0) return null;
  let inicio = i;
  for (let k = i; k >= 0 && dela(k); k--) {
    inicio = k;
    const inp = inputs[k];
    if (inp.t === 'a' && INICIO_DE_JOGADA.has(inp.a.kind)) break;
  }
  // alguém saiu da partida depois: voltar traria a pessoa de volta
  if (inputs.slice(inicio).some((x) => x.t === 'concede')) return null;
  return inicio;
}

/** a partida como estava logo antes da entrada `alvo`, a partir do checkpoint mais próximo */
export function reconstruir(config: GameConfig, decks: DeckList[], inputs: Input[], checkpoints: (Checkpoint | null)[], alvo: number): Game {
  const prefixo = inputs.slice(0, alvo);
  const cp = checkpoints.filter((c): c is Checkpoint => !!c && c.inputIndex <= alvo).sort((a, b) => b.inputIndex - a.inputIndex)[0];
  return cp ? Game.fromCheckpoint(cp, decks, prefixo) : Game.replay(config, decks, prefixo);
}

/** o que volta: a jogada da pessoa e, depois dela, o que aparece no registro para todos */
export function linhasDesfeitas(atual: Game, voltar: Game, entrada: Input): LinhaDesfeita[] {
  const nomes = voltar.state.players.map((p) => p.name);
  const quem = entrada.t === 'a' ? entrada.p : -1;
  const linhas: LinhaDesfeita[] = [];
  const d = voltar.pending;
  if (entrada.t === 'a' && d && d.player === quem) {
    const a = entrada.a;
    let texto: string | null = null;
    if (a.kind === 'priority' && d.kind === 'priority') {
      const acao = d.actions.find((x) => x.id === a.action);
      texto = a.action === 'pass' ? `${nomes[quem]} passa a prioridade` : acao ? `${nomes[quem]}: ${acao.label}` : null;
    } else if (a.kind === 'attackers') texto = `${nomes[quem]} declara ${a.attacks.length ? `ataque com ${a.attacks.length}` : 'que não ataca'}`;
    else if (a.kind === 'blockers') texto = `${nomes[quem]} declara ${a.blocks.length ? `bloqueio com ${a.blocks.length}` : 'que não bloqueia'}`;
    if (texto) linhas.push({ texto, outro: false });
  }
  for (const e of atual.state.log.slice(voltar.state.log.length)) {
    const texto = e.visibleTo === null ? e.text : e.hiddenText;
    if (!texto || /^Turno \d+:/.test(texto)) continue;
    const autor = nomes.findIndex((n) => texto.startsWith(`${n} `) || texto.startsWith(`${n}:`));
    linhas.push({ texto, outro: autor >= 0 && autor !== quem });
  }
  // conjurar, jogar ou ativar já aparecem no registro do jeito de sempre ("Ana conjura…"): a descrição sai
  const passe = entrada.t === 'a' && entrada.a.kind === 'priority' && entrada.a.action === 'pass';
  if (!passe && linhas.length > 1 && !linhas[0].outro && linhas.slice(1).some((l) => !l.outro)) linhas.shift();
  return linhas.slice(0, 10);
}
