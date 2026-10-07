// Uma decisão de bot pensada fora da partida (fase 9): na thread de pensar do servidor (servidor/pensadores.ts) e nos
// testes. Recebe só um checkpoint, as entradas seguintes e o estado do bot; refaz a partida, sorteia de novo o que o
// assento do bot não vê (bots/mundo.ts) e decide nesse mundo.

import type { LiveDecision } from '../motor/ask.ts';
import { Game, type Checkpoint, type Input } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { Answer, GameConfig, PlayerId } from '../motor/types.ts';
import { buildView } from '../motor/view.ts';
import { Contexto, HeuristicBot, type EstadoBot, type OpcoesBot } from './heuristico.ts';
import { Copiador, estadoOculto, ramo } from './mundo.ts';
import type { NivelBot } from './niveis.ts';

export interface Tarefa {
  nivel: NivelBot;
  eu: PlayerId;
  estado: EstadoBot;
  /** estado numa decisão de prioridade anterior (ou na atual) e as entradas desde então; sem checkpoint (começo da
   *  partida, antes da primeira prioridade), a partida é refeita desde o início com `config` */
  cp: Checkpoint | null;
  entradas: Input[];
  config?: GameConfig;
  /** id da decisão que o bot precisa responder (confere que a partida refeita chegou nela) */
  decisao: number;
  /** teto de tempo desta decisão, em ms (o do nível, ou menos) */
  tempo?: number;
  /** sobreposições do nível (testes) */
  opcoes?: OpcoesBot;
  /** o servidor já tentou a resposta imediata (bot.imediata) com a vista do bot e precisa pensar */
  jaImediata?: boolean;
}

export interface Pensado {
  resposta: Answer | null;
  estado: EstadoBot;
  /** checkpoint na última decisão de prioridade (a thread guarda para refazer menos na próxima) */
  cp: Checkpoint | null;
  ms: number;
}

export function pensar(t: Tarefa, decks: DeckList[]): Pensado {
  const inicio = performance.now();
  const bot = new HeuristicBot('pensar', t.eu, { nivel: t.nivel, ...t.opcoes, ...(t.tempo !== undefined ? { orcamento: t.tempo } : {}) });
  bot.e = t.estado;
  let base = t.cp;
  let entradas = t.entradas;
  if (!base) {
    // começo da partida: refaz desde a semente; numa decisão de prioridade, vira checkpoint
    const game = Game.replay(t.config!, decks, t.entradas);
    const cp = game.checkpoint();
    if (cp) { base = { state: cp.state, inputIndex: t.entradas.length }; entradas = []; } else {
      const d = game.pending as LiveDecision | null;
      if (!d || d.id !== t.decisao || d.player !== t.eu) return { resposta: null, estado: bot.e, cp: null, ms: performance.now() - inicio };
      const info = bot.infoOculta();
      const sem = ramo(bot.e.rng, 'mundo');
      const ctx = new Contexto(d, () => estadoOculto(game, t.eu, sem, info), null, inicio + bot.p.tempo);
      const resposta = (t.jaImediata ? null : bot.imediata(d, buildView(game.g, t.eu, d), (a) => ctx.valida(a))) ?? bot.decidir(ctx);
      return { resposta, estado: bot.e, cp: null, ms: performance.now() - inicio };
    }
  }
  const cop = new Copiador({ cp: base, decks, entradas });
  const info = bot.infoOculta();
  const mundo = cop.copia(t.eu, ramo(bot.e.rng, 'mundo'), info);
  if (!mundo?.pending || mundo.pending.id !== t.decisao || mundo.pending.player !== t.eu) {
    return { resposta: null, estado: bot.e, cp: cop.cp, ms: performance.now() - inicio };
  }
  const d = mundo.pending as LiveDecision;
  const ctx = new Contexto(d, () => mundo.g, (s) => { const f = cop.copia(t.eu, [...s] as typeof s, info); return f && f.pending?.id === d.id ? f : null; }, inicio + bot.p.tempo);
  const resposta = (t.jaImediata ? null : bot.imediata(d, buildView(mundo.g, t.eu, d), (a) => ctx.valida(a))) ?? bot.decidir(ctx);
  return { resposta, estado: bot.e, cp: cop.cp, ms: performance.now() - inicio };
}
