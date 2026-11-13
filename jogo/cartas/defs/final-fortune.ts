// Final Fortune
// Take an extra turn after this one. At the beginning of that turn's end step, you lose the game.
import { defineAbility, defineCard, loseGame, takeExtraTurn, triggered } from '../../motor/api.ts';
import { jog, reg } from '../../motor/registro.ts';

// o gatilho atrasado só olha o turno extra criado por esta mágica (CR 603.7)
const PERDE = defineAbility('Final Fortune:perde', triggered({
  kind: 'event',
  match: (e, c) => {
    const d = (c as unknown as { delayed?: { data: Record<string, unknown> } }).delayed;
    return e.type === 'step' && e.step === 'end' && c.g.state.turn.extraTurnId !== undefined && c.g.state.turn.extraTurnId === d?.data.turno;
  },
}, function* (c) {
  reg(c.g, 'fim', { rule: '104.3e' })`${jog(c.you)} perde o jogo (Final Fortune).`;
  loseGame(c.g, c.you);
}, { text: 'No início da etapa final desse turno, você perde o jogo.' }));

export default defineCard({
  name: 'Final Fortune',
  faces: [{
    spell: {
      *effect(c) {
        // CR 500.7: o turno extra vem logo depois deste
        const turno = takeExtraTurn(c.g, c.you);
        const s = c.g.state;
        s.delayedTriggers.push({ id: s.nextId++, abilityId: PERDE.id!, source: c.source, controller: c.you, data: { turno }, once: true, expiresTurn: null, createdTurn: s.turn.number, createdStep: s.turn.step });
        c.g.bump();
      },
    },
  }],
  rulings: {
    1: 'teste: dois turnos extras: o criado por último é tomado primeiro',
    2: 'regra geral: CR 500.7 — um turno extra pulado não chega à etapa final, e o gatilho não dispara',
  },
});
