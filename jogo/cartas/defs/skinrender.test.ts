import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Skinrender', () => {
  it('três marcadores -1/-1 na criatura alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Gau, Feral Youth']], hand: [['Skinrender'], []] });
    tg.choose('criatura alvo', ['Gau, Feral Youth']);
    tg.cast('Skinrender').resolve().resolveAll();
    expect(tg.find('Gau, Feral Youth')).toBeNull();
  });
  it('sem outra criatura, mira a si mesma', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Skinrender'], []] });
    tg.cast('Skinrender').resolve().resolveAll();
    expect(tg.find('Skinrender')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Skinrender']);
  });
});
