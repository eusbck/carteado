// lote3-f: turnos extras (CR 500.7), em motor/turn.ts e motor/cedh.ts takeExtraTurn
import { describe, expect, it } from 'vitest';
import { takeExtraTurn } from '../motor/api.ts';
import { setup } from './harness.ts';

const BIB = (n: number) => Array(n).fill('Island');

describe('turno extra', () => {
  it('CR 500.7: o turno extra vem logo depois do atual, e a ordem normal continua depois de quem tinha o turno', () => {
    const tg = setup({ players: 3, library: [BIB(5), BIB(5), BIB(5)] });
    // Bruno ganha um turno extra durante o turno de Ana: Ana, Bruno (extra), Bruno, Carla
    takeExtraTurn(tg.g, 1);
    tg.refresh();
    const ordem: number[] = [];
    let turno = tg.state.turn.number;
    tg.passUntil((t) => {
      if (t.state.turn.number !== turno) { turno = t.state.turn.number; ordem.push(t.state.turn.active); }
      return ordem.length >= 3;
    });
    expect(ordem).toEqual([1, 1, 2]);
  });

  it('CR 500.7: com dois turnos extras, o criado por último é tomado primeiro', () => {
    const tg = setup({ players: 3, library: [BIB(5), BIB(5), BIB(5)] });
    const a = takeExtraTurn(tg.g, 2);
    const b = takeExtraTurn(tg.g, 1);
    tg.refresh();
    const vistos: (number | undefined)[] = [];
    let turno = tg.state.turn.number;
    tg.passUntil((t) => {
      if (t.state.turn.number !== turno) { turno = t.state.turn.number; vistos.push(t.state.turn.extraTurnId); }
      return vistos.length >= 3;
    });
    expect(vistos).toEqual([b, a, undefined]);
  });

  it('CR 800.4a: o turno extra de quem saiu da partida não acontece', () => {
    const tg = setup({ players: 3, library: [BIB(5), BIB(5), BIB(5)] });
    takeExtraTurn(tg.g, 2);
    tg.state.players[2].left = true;
    tg.refresh();
    const turno = tg.state.turn.number;
    tg.passUntil((t) => t.state.turn.number !== turno);
    expect(tg.state.turn.active).toBe(1);
    expect(tg.state.turn.extraTurnId).toBeUndefined();
  });
});
