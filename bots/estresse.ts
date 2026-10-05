// Teste de estresse: partidas inteiras com bots, conferindo invariantes a cada resposta.
// Uso: node bots/estresse.ts [partidas] [jogadores] [bot: aleatorio|heuristico] [semente-base]
// Registra as falhas em .cache/falhas/ com semente e entradas para reproduzir.

import '../cartas/index.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import decks from '../gerado/decks.json' with { type: 'json' };
import { Game } from '../motor/game.ts';
import { checkInvariants } from '../motor/invariants.ts';
import { int, seedFrom } from '../motor/rng.ts';
import type { DeckList } from '../motor/state.ts';
import type { Answer, Decision } from '../motor/types.ts';
import { RandomBot } from './aleatorio.ts';
import { HeuristicBot } from './heuristico.ts';

export interface BotLike { answer(d: Decision, game: Game): Answer }

export interface RunResult {
  seed: string;
  ok: boolean;
  error?: string;
  turns: number;
  decisions: number;
  winners: number[];
  draw: boolean;
  reason: string;
  ms: number;
}

export function runGame(seed: string, players: number, makeBot: (p: number, seed: string) => BotLike, opts: { turnLimit?: number; maxDecisions?: number; invariants?: boolean } = {}): RunResult {
  const rng = seedFrom(`decks:${seed}`);
  const all = decks as DeckList[];
  const chosen: DeckList[] = [];
  for (let i = 0; i < players; i++) chosen.push(all[int(rng, all.length)]);
  const config = {
    seed, players: chosen.map((d, i) => ({ name: `Bot ${i + 1}`, deckId: d.id })),
    startingLife: 40, turnLimit: opts.turnLimit ?? (players > 2 ? 60 : 40), multiplayer: players > 2,
  };
  const t0 = Date.now();
  const bots = chosen.map((_, i) => makeBot(i, seed));
  let game: Game | null = null;
  let decisions = 0;
  try {
    game = Game.create(config, chosen);
    const max = opts.maxDecisions ?? 60000;
    while (game.pending && !game.isOver()) {
      if (++decisions > max) throw new Error(`Mais de ${max} decisões: provável laço`);
      const d = game.pending;
      const a = bots[d.player].answer(d, game);
      const r = game.answer(d.player, a);
      if (!r.ok) {
        // resposta do bot recusada: tenta a resposta padrão segura
        throw new Error(`Bot ${d.player} deu resposta recusada em ${d.kind} (${d.prompt}): ${r.error}`);
      }
      if (opts.invariants !== false) {
        const errs = checkInvariants(game.state);
        if (errs.length) throw new Error(`Invariantes violadas: ${errs.slice(0, 5).join('; ')}`);
      }
    }
    const s = game.state;
    if (!s.gameOver) throw new Error('A partida parou sem decisão pendente e sem fim');
    return { seed, ok: true, turns: s.turn.number, decisions, winners: s.gameOver.winners, draw: s.gameOver.draw, reason: s.gameOver.reason, ms: Date.now() - t0 };
  } catch (e) {
    const err = e as Error;
    if (game) {
      const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'falhas');
      mkdirSync(raiz, { recursive: true });
      writeFileSync(join(raiz, `${seed}.json`), JSON.stringify({ seed, config, decks: chosen.map((d) => d.id), error: err.message, stack: err.stack, inputs: game.inputs }, null, 1));
    }
    return { seed, ok: false, error: `${err.message}\n${err.stack?.split('\n').slice(1, 6).join('\n')}`, turns: game?.state.turn.number ?? 0, decisions, winners: [], draw: false, reason: '', ms: Date.now() - t0 };
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const n = Number(process.argv[2] ?? 20);
  const players = Number(process.argv[3] ?? 4);
  const tipo = process.argv[4] ?? 'aleatorio';
  const base = process.argv[5] ?? 'estresse';
  // simulações por decisão dos bots heurísticos; no estresse, menos que no servidor
  const simulacoes = Number(process.env.SIMULACOES ?? 16);
  const inicio = Number(process.env.INICIO ?? 0);
  let ok = 0;
  const t0 = Date.now();
  let totalDecisions = 0;
  for (let i = inicio; i < inicio + n; i++) {
    const seed = `${base}-${players}p-${i}`;
    const r = runGame(seed, players, (p, s) => {
      if (tipo === 'heuristico') { const b = new HeuristicBot(`${s}:${p}`, p, { simulacoes }); return { answer: (d, game) => b.answer(d, game) }; }
      const b = new RandomBot(`${s}:${p}`);
      return { answer: (d) => b.answer(d) };
    });
    totalDecisions += r.decisions;
    if (r.ok) { ok++; console.log(`${seed}: ok — ${r.turns} turnos, ${r.decisions} decisões, ${r.draw ? 'empate' : `vencedor ${r.winners.join(',')}`} (${r.reason}), ${r.ms} ms`); }
    else console.log(`${seed}: FALHOU — ${r.error}`);
  }
  const secs = (Date.now() - t0) / 1000;
  console.log(`\n${ok}/${n} partidas sem erro em ${secs.toFixed(1)} s (${Math.round(totalDecisions / secs)} decisões/s)`);
  process.exit(ok === n ? 0 : 1);
}
