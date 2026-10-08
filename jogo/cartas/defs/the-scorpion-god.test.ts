import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('The Scorpion God', () => {
  it('uma carta por criatura, mesmo com vários marcadores', () => {
    const tg = setup({ battlefield: [['The Scorpion God', 'Swamp', 'Mountain', 'Mountain', 'Swamp', 'Mountain', 'Mountain'], ['Elvish Mystic']], library: [['Island', 'Island'], []] });
    tg.choose('outra criatura alvo', ['Elvish Mystic']);
    tg.activate('The Scorpion God').resolve().resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('morrendo com marcador, compra pela própria morte e volta à mão na etapa final', () => {
    const tg = setup({ battlefield: [[{ name: 'The Scorpion God', counters: { '-1/-1': 1 } }], []], library: [['Island', 'Island'], ['Island']] });
    tg.run(destroy(tg.g, [tg.bf('The Scorpion God')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    tg.passTo('end').resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'The Scorpion God']);
  });
});
