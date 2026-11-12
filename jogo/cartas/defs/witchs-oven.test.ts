import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Witch's Oven";

describe(N, () => {
  it('sacrificar uma criatura de resistência menor que 4 cria uma Food', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []] });
    tg.choose('Sacrifique', ['Elvish Mystic']).activate(N).resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('com resistência 4 ou mais, cria duas Foods', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []] });
    tg.choose('Sacrifique', ['Indomitable Ancients']).activate(N).resolveAll();
    expect(tg.all('Food')).toHaveLength(2);
  });
});
