// Fase 9, item 1.5: nenhum bot, de nenhum nível, decide olhando o que o assento dele não vê.
// Numa partida de semente fixa, a cada decisão do bot a mesma situação é montada de novo com a mão e o grimório da
// pessoa trocados (e a ordem do grimório do próprio bot): enquanto a vista do bot (motor/view.ts) é a mesma, a
// resposta tem de ser a mesma, pelo caminho do servidor (bots/pensar.ts) e pelo da partida local (bot.answer).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import { HeuristicBot, type OpcoesBot } from '../bots/heuristico.ts';
import { NIVEIS_BOT, type NivelBot } from '../bots/niveis.ts';
import { pensar } from '../bots/pensar.ts';
import { auditoria } from '../bots/mundo.ts';
import { createHash } from 'node:crypto';
import { observar, memoriaVazia } from '../bots/memoria.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { Game, type Checkpoint } from '../motor/game.ts';
import { checkInvariants } from '../motor/invariants.ts';
import type { DeckList } from '../motor/state.ts';
import type { Answer, Decision, GameState } from '../motor/types.ts';
import { buildView } from '../motor/view.ts';

const DECKS = decksJson as DeckList[];
const PESSOA = 0;
const BOT = 1;

/** a mesma partida com o escondido trocado: conteúdo da mão e do grimório da pessoa embaralhados entre si, e o
 *  grimório do bot em outra ordem */
function trocarEscondido(st: GameState): GameState {
  const s = structuredClone(st);
  const girar = (ids: number[], passo: number) => {
    const conteudo = ids.map((id) => ({ def: s.objects[id].def, card: s.objects[id].card }));
    ids.forEach((id, i) => { const c = conteudo[(i + passo) % conteudo.length]; s.objects[id].def = c.def; s.objects[id].card = c.card; });
  };
  girar([...s.zones.hand[PESSOA], ...s.zones.library[PESSOA]], 5);
  girar([...s.zones.library[BOT]], 7);
  return s;
}

/** a vista do bot, com a decisão (as cartas que ela mostra, ex. numa busca no próprio grimório), sem o registro */
const vista = (g: Game) => JSON.stringify({ ...buildView(g.g, BOT, g.pending), log: [] });

function pessoa(d: Decision): Answer {
  if (d.kind === 'mulligan') return { kind: 'mulligan', keep: true };
  if (d.kind === 'payment') return { kind: 'payment', auto: true };
  return defaultAnswer(d);
}

const ORCAMENTO: Record<NivelBot, OpcoesBot> = {
  // só contagens (sem teto de tempo que mude a resposta conforme a máquina)
  iniciante: { orcamento: 1e9 },
  facil: { orcamento: 1e9, simulacoes: 4 },
  intermediario: { orcamento: 1e9, simulacoes: 6 },
  dificil: { orcamento: 1e9, simulacoes: 8, mundos: 2 },
  cartomante: { orcamento: 1e9, simulacoes: 8, mundos: 2, jogadasBusca: 1 },
  magicgod: { orcamento: 1e9, simulacoes: 8, mundos: 2, jogadasBusca: 1 },
};

describe('fase 9: o bot nunca vê a mão nem o grimório de ninguém (1.5)', () => {
  for (const { id: nivel } of NIVEIS_BOT) {
    it(nivel, () => {
      const config = { seed: `oculto-${nivel}`, players: [{ name: 'Ana', deckId: DECKS[0].id }, { name: 'ROBSON', deckId: DECKS[3].id }], startingLife: 40, turnLimit: 30, multiplayer: false };
      const decks = [DECKS[0], DECKS[3]];
      const game = Game.create(config, decks);
      const bot = new HeuristicBot('t', BOT, { nivel, ...ORCAMENTO[nivel] });
      let cpTurno: Checkpoint | null = null;
      let comparadas = 0;
      let iguais = 0;
      const limite = nivel === 'magicgod' ? 8 : 16;
      for (let k = 0; k < 4000 && game.pending && !game.isOver() && comparadas < limite; k++) {
        const d = game.pending;
        // o escondido é trocado a partir da última decisão de prioridade (o que o bot já comprou continua o mesmo)
        if (d.kind === 'priority') cpTurno = game.checkpoint();
        if (d.player === PESSOA) { expect(game.answer(PESSOA, pessoa(d)).ok).toBe(true); continue; }
        // só as decisões em que o bot pensa (as óbvias saem da vista dele, que é igual nos dois casos)
        const teste = new HeuristicBot('t', BOT, { nivel, ...ORCAMENTO[nivel] });
        teste.e = structuredClone(bot.e);
        const pensa = teste.imediata(d, buildView(game.g, BOT, d), (a) => game.check(BOT, a) === null) === null;
        // a situação trocada: refeita do começo do turno com o escondido trocado
        if (cpTurno && pensa) {
          const entradas = game.inputs.slice(cpTurno.inputIndex);
          const trocado: Checkpoint = { state: trocarEscondido(cpTurno.state), inputIndex: 0 };
          let outra: Game | null = null;
          try { outra = Game.fromCheckpoint(trocado, decks, entradas); } catch { outra = null; }
          if (outra?.pending?.id === d.id && vista(outra) === vista(game)) {
            expect(checkInvariants(outra.state)).toEqual([]);
            // caminho do servidor
            const estado = structuredClone(bot.e);
            if (estado.memoria) { observar(estado.memoria, game.g, BOT); }
            const estadoB = structuredClone(bot.e);
            if (estadoB.memoria) { observar(estadoB.memoria, outra.g, BOT); expect(estadoB.memoria).toEqual(estado.memoria); }
            // cada mundo que o bot monta tem de ser idêntico (não só a resposta): é o que garante que nada escondido entra
            const mundosA: string[] = [];
            const mundosB: string[] = [];
            const resumo = (st: GameState) => createHash('sha1').update(JSON.stringify({ ...st, version: 0 })).digest('hex');
            auditoria.mundo = (st) => mundosA.push(resumo(st));
            const a = pensar({ nivel, eu: BOT, estado, cp: { state: cpTurno.state, inputIndex: 0 }, entradas, decisao: d.id, opcoes: ORCAMENTO[nivel] }, decks);
            auditoria.mundo = (st) => mundosB.push(resumo(st));
            const b = pensar({ nivel, eu: BOT, estado: estadoB, cp: trocado, entradas, decisao: d.id, opcoes: ORCAMENTO[nivel] }, decks);
            auditoria.mundo = null;
            expect(mundosA.length).toBeGreaterThan(0);
            expect(mundosB, `${nivel}: mundos diferentes na decisão ${d.kind} do turno ${game.state.turn.number}`).toEqual(mundosA);
            expect(b.resposta, `${nivel}, decisão ${d.kind} no turno ${game.state.turn.number}`).toEqual(a.resposta);
            // caminho da partida local, numa decisão de prioridade
            if (d.kind === 'priority') {
              const b1 = new HeuristicBot('t', BOT, { nivel, ...ORCAMENTO[nivel] });
              const b2 = new HeuristicBot('t', BOT, { nivel, ...ORCAMENTO[nivel] });
              b1.e = structuredClone(bot.e);
              b2.e = structuredClone(bot.e);
              const copiaA = Game.fromCheckpoint(game.checkpoint()!, decks, game.inputs);
              expect(b2.answer(outra.pending!, outra)).toEqual(b1.answer(copiaA.pending!, copiaA));
            }
            comparadas++;
            if (JSON.stringify(a.resposta) === JSON.stringify(b.resposta)) iguais++;
          }
        }
        const r = game.answer(BOT, bot.answer(d, game));
        expect(r.ok).toBe(true);
      }
      expect(comparadas).toBeGreaterThanOrEqual(nivel === 'magicgod' ? 4 : 8);
      expect(iguais).toBe(comparadas);
      void memoriaVazia;
    }, 600000);
  }
});
