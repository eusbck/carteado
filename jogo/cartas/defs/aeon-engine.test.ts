import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Aeon Engine';

describe(N, () => {
  it('entra virado', () => {
    const tg = setup({ battlefield: [[], []] });
    const id = enterCard(tg, N, 0)!;
    expect(tg.state.objects[id].tapped).toBe(true);
  });

  it('inverte a ordem dos turnos, e as escolhas em ordem de turno seguem a ordem nova', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []] });
    expect(tg.g.nextPlayer(0)).toBe(1);
    tg.activate(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.g.nextPlayer(0)).toBe(2);
    expect(tg.g.apnap()).toEqual([0, 2, 1]);
    // a ordem dos assentos não muda
    expect(tg.state.turnOrder).toEqual([0, 1, 2]);
    tg.passTo('upkeep');
    expect(tg.state.turn.active).toBe(2);
    tg.passTo('upkeep', 1);
    expect(tg.state.turn.active).toBe(1);
    tg.passTo('upkeep', 0);
    // uma volta inteira na ordem nova é uma rodada
    expect(tg.state.turn.round).toBe(2);
  });

  it('invertida de novo, a ordem volta à do começo da partida', () => {
    const tg = setup({ players: 3, battlefield: [[N, N], [], []] });
    tg.activate(N).resolveAll();
    tg.activate(N).resolveAll();
    expect(tg.g.nextPlayer(0)).toBe(1);
    expect(tg.g.apnap()).toEqual([0, 1, 2]);
  });

  it('com dois jogadores, nada muda', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.activate(N).resolveAll();
    expect(tg.g.nextPlayer(0)).toBe(1);
    expect(tg.g.nextPlayer(1)).toBe(0);
  });
});
