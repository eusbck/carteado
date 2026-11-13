import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Final Fortune';

describe(NOME, () => {
  it('você toma um turno extra e perde o jogo no início da etapa final dele', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [[NOME], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    const turno = tg.state.turn.number;
    tg.cast(NOME).resolve();
    tg.passUntil((t) => t.state.turn.number > turno);
    expect(tg.state.turn.active).toBe(0);
    expect(tg.state.turn.extraTurnId).toBeDefined();
    expect(tg.state.players[0].lost).toBeFalsy();
    tg.passUntil((t) => t.state.gameOver !== null || t.state.players[0].lost === true);
    expect(tg.state.turn.step).toBe('end');
    expect(tg.state.players[0].lost).toBe(true);
  });

  it('dois turnos extras: o criado por último é tomado primeiro', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], [], []], hand: [[NOME, NOME], [], []], library: [['Island', 'Island'], ['Island'], ['Island']] });
    const turno = tg.state.turn.number;
    tg.cast(NOME).resolve();
    tg.cast(NOME).resolve();
    expect(tg.state.extraTurns).toHaveLength(2);
    const ultimo = tg.state.extraTurns![1].id;
    tg.passUntil((t) => t.state.turn.number > turno);
    expect(tg.state.turn.active).toBe(0);
    expect(tg.state.turn.extraTurnId).toBe(ultimo);
  });
});
