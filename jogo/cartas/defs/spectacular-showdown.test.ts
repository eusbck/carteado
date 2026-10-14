import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Spectacular Showdown';

describe(NOME, () => {
  it('sem sobrecarga: marcador de golpe duplo e goad na criatura alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Wall of Omens'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(NOME).resolve();
    const anc = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anc].counters['double strike']).toBe(1);
    expect(hasKw(tg.g, anc, 'double strike')).toBe(true);
    expect(tg.state.objects[anc].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['double strike'] ?? 0).toBe(0);
  });

  it('sobrecarga: um marcador de golpe duplo em cada criatura, todas goadadas, sem alvo', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Mountain'), 'Wall of Omens'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.cast(NOME, 'overload').resolve();
    for (const n of ['Wall of Omens', 'Indomitable Ancients']) {
      const id = tg.bf(n);
      expect(tg.state.objects[id].counters['double strike']).toBe(1);
      expect(tg.state.objects[id].goadedBy.map((x) => x.player)).toEqual([0]);
    }
  });
});
