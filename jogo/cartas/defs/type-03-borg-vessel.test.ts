import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Type-03 Borg Vessel';

describe(N, () => {
  it('as mágicas de artefato custam {1} a menos; abaixo de 7 marcadores não cria fichas nem é criatura', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []], hand: [['Steel Overseer'], []] });
    expect(chars(tg.g, tg.bf(N)).types).not.toContain('Creature');
    tg.cast('Steel Overseer').resolveAll();
    expect(tg.find('Steel Overseer')).not.toBeNull();
    expect(tg.all('Borg')).toHaveLength(0);
  });

  it('com 7 marcadores é uma criatura 5/5 com voar, e cada mágica conjurada cria uma ficha Borg', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 7 } }, 'Plains', 'Plains'], []], hand: [['Wall of Omens'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.all('Borg')).toHaveLength(1);
  });
});
