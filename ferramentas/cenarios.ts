// Salas prontas numa situação de jogo, para as capturas de tela: bots jogam por todos os assentos
// até a situação pedida e a partida é gravada no banco; o servidor retoma a sala e o assento 0
// fica para a pessoa no navegador (entra com o token `token-<CÓDIGO>`).

import '../cartas/index.ts';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import { HeuristicBot } from '../bots/heuristico.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { DEFAULT_STOPS } from '../motor/autopass.ts';
import { Game } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision, GameConfig } from '../motor/types.ts';
import type { Banco } from '../servidor/banco.ts';

const DECKS = decksJson as DeckList[];

interface Cenario {
  codigo: string;
  modo: '4p' | '1v1';
  decks: number[];
  /** sementes conhecidas que chegam na situação (as seguintes são tentadas se o motor mudar) */
  sementes: string[];
  minTurno: number;
  pred: (g: Game, d: Decision) => boolean;
}

export const CENARIOS: Cenario[] = [
  // Ana declara atacantes em 4 jogadores, com pelo menos 3 criaturas que podem atacar
  { codigo: 'ATACA', modo: '4p', decks: [0, 2, 4, 5], sementes: ['prototipo8-ATACA-7'], minTurno: 9, pred: (g, d) => d.player === 0 && d.kind === 'attackers' && d.candidates.length >= 3 },
  // Ana declara bloqueadores num 1v1, com pelo menos 2 criaturas que podem bloquear
  { codigo: 'BLOQU', modo: '1v1', decks: [3, 1], sementes: ['prototipo8-BLOQU-0'], minTurno: 7, pred: (g, d) => d.player === 0 && d.kind === 'blockers' && d.candidates.filter((c) => c.canBlock.length).length >= 2 },
  // fase 9: Ana ataca e ordena pelo menos três gatilhos (a janela de escolha em fila); depois a busca e a vidência pelo ajuste manual
  { codigo: 'ORDEM', modo: '1v1', decks: [4, 0], sementes: ['gatilhos-1v1-4-0'], minTurno: 10, pred: (g, d) => d.player === 0 && d.kind === 'select' && !!d.ordered && d.min === d.items.length && d.items.length >= 3 },
];

/** grava as salas pedidas no banco; devolve os códigos que ficaram prontos */
export function gerarSalas(banco: Banco, codigos: string[]): string[] {
  const prontas: string[] = [];
  for (const c of CENARIOS.filter((x) => codigos.includes(x.codigo))) {
    const sementes = [...c.sementes, ...Array.from({ length: 10 }, (_, k) => `${c.codigo}-extra-${k}`)];
    for (const seed of sementes) {
      const nomes = c.modo === '4p' ? ['Ana', 'Bruno', 'Caio', 'Dani'] : ['Ana', 'Bruno'];
      const config: GameConfig = { seed, players: nomes.map((name, i) => ({ name, deckId: DECKS[c.decks[i]].id })), startingLife: 40, turnLimit: null, multiplayer: c.modo === '4p', manualMode: true, mulligan: 'londres' };
      const decks = c.decks.map((i) => DECKS[i]);
      const game = Game.create(config, decks);
      const bots = nomes.map((_, i) => new HeuristicBot(`${seed}:${i}`, i, { simulacoes: 4 }));
      let chegou = false;
      for (let k = 0; k < 20000 && game.pending && !game.isOver(); k++) {
        const d = game.pending;
        if (game.state.turn.number >= c.minTurno && c.pred(game, d)) { chegou = true; break; }
        if (game.state.turn.number > c.minTurno + 10) break;
        const r = game.answer(d.player, bots[d.player].answer(d, game));
        if (!r.ok) game.answer(d.player, defaultAnswer(d));
      }
      if (!chegou) continue;
      const assentos = nomes.map((nome, i) => ({ tipo: i === 0 ? 'humano' : 'bot', nome, deck: DECKS[c.decks[i]].id, token: i === 0 ? `token-${c.codigo}` : null, paradas: structuredClone(DEFAULT_STOPS) }));
      banco.salvarSala(c.codigo, { codigo: c.codigo, senha: '00:00', modo: c.modo, estado: 'jogando', assentos, anfitriao: 0, partida: { config, deckIds: decks.map((d) => d.id), checkpoint: null, posicoes: {} }, mulligan: 'londres' });
      banco.adicionarEntradas(c.codigo, 0, game.inputs);
      prontas.push(c.codigo);
      break;
    }
  }
  return prontas;
}
