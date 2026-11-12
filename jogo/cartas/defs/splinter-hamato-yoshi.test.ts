import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Splinter, Hamato Yoshi';

describe(N, () => {
  it('pelo sneak, entra virado e atacando quem a criatura devolvida atacava', () => {
    const tg = setup({ players: 3, battlefield: [['Memnite', 'Swamp'], [], []], hand: [[N], [], []] });
    tg.attack([['Memnite', 2]]).passTo('declareBlockers');
    tg.cast(N, 'sneak').resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.state.combat!.attackers.find((a) => a.id === id && !a.removed)?.target).toEqual({ kind: 'player', id: 2 });
    expect(tg.find('Memnite', 'hand', 0)).not.toBeNull();
  });
  it('tem ameaçar; os outros Ninjas que você controla recebem +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Universal Automaton', 'Memnite'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([1, 3]);
    expect(tg.pt(tg.bf('Universal Automaton'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Memnite'))).toEqual([1, 1]);
  });
});
