import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Immoral Bargain', () => {
  it('sacrifica X criaturas e destrói X permanentes não terreno', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Forest', 'Elvish Mystic', 'Wall of Omens'], ['Sol Ring', 'Ghostly Prison', 'Glissa Sunslayer']], hand: [['Immoral Bargain'], []] });
    tg.number('valor de X', 2).choose('sacrif', ['Elvish Mystic', 'Wall of Omens']).choose('X permanentes não terreno', ['Sol Ring', 'Ghostly Prison']);
    tg.cast('Immoral Bargain').resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Ghostly Prison')).toBeNull();
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
  });
});
