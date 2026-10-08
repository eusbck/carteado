import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Weathered Sentinels', () => {
  it('só ataca quem atacou você no último turno; ao atacar, +3/+3 e indestrutível', () => {
    const tg = setup({ players: 3, battlefield: [[{ name: 'Weathered Sentinels', ready: true }], [], []], library: [['Island'], ['Island'], ['Island']] });
    tg.state.lastTurnAttackedPlayers[1] = [0];
    tg.state.lastTurnAttackedPlayers[2] = [1];
    tg.refresh();
    let alvos: number[] = [];
    const s = tg.bf('Weathered Sentinels');
    tg.script.push((d) => (d.kind === 'attackers' ? (alvos = d.candidates.find((x) => x.obj === s)!.targets.map((t) => t.id), { kind: 'attackers', attacks: [[s, { kind: 'player', id: 1 }]] }) : null));
    tg.passTo('declareAttackers').resolveAll();
    expect(alvos).toEqual([1]);
    expect(tg.pt(s)).toEqual([5, 8]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(35);
  });
});
