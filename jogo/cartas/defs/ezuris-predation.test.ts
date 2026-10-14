import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = "Ezuri's Predation";

describe(N, () => {
  it('uma Phyrexian Beast 4/4 por criatura dos oponentes, cada uma luta com uma delas ao mesmo tempo', () => {
    const tg = fixture({
      players: 3,
      battlefield: [[...Array(8).fill('Forest'), 'Wall of Omens'], ['Elvish Mystic', 'Indomitable Ancients'], ['Ripjaw Raptor']],
      hand: [[N], [], []],
    });
    tg.cast(N);
    while (tg.state.zones.stack.length) tg.pass();
    tg.resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.state.objects[tg.bf('Ripjaw Raptor')].damage).toBe(4);
    // a que lutou com o Raptor (força 4) morre; as outras duas ficam
    const feras = tg.all('Phyrexian Beast');
    expect(feras).toHaveLength(2);
    expect(feras.map((id) => tg.state.objects[id].damage).sort()).toEqual([1, 2]);
    // a Wall of Omens de Ana não luta
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
  });
});
