import { describe, expect, it } from 'vitest';
import { manaValue } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = "Curtains' Call";

describe(N, () => {
  it('precisa de duas criaturas para conjurar; destrói as duas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Memnite']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
    const tg2 = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Memnite', 'Ornithopter']], hand: [[N], []] });
    tg2.cast(N).resolve();
    expect(tg2.find('Memnite')).toBeNull();
    expect(tg2.find('Ornithopter')).toBeNull();
  });
  it('com três oponentes custa {2}{B}; o valor de mana continua 6', () => {
    const tg = setup({ players: 4, battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Memnite'], ['Ornithopter'], []], hand: [[N], [], [], []] });
    expect(manaValue(tg.g, tg.find(N, 'hand', 0)!)).toBe(6);
    expect(tg.canCast(N)).toBe(true);
    const tg2 = setup({ players: 4, battlefield: [['Swamp', 'Swamp'], ['Memnite'], ['Ornithopter'], []], hand: [[N], [], [], []] });
    expect(tg2.canCast(N)).toBe(false);
  });
});
