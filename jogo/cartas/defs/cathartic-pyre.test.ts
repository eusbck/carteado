import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Cathartic Pyre', () => {
  it('modo 1: 3 de dano à criatura alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], ['Arboreal Grazer']], hand: [['Cathartic Pyre'], []] });
    tg.choose('modo', ['Causa 3 de dano à criatura ou planeswalker alvo']).choose('criatura ou planeswalker', ['Arboreal Grazer']).cast('Cathartic Pyre').resolve();
    expect(tg.find('Arboreal Grazer')).toBeNull();
  });
  it('modo 2: descarta até duas e compra o mesmo número', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [['Cathartic Pyre', 'Plains', 'Island', 'Forest'], []], library: [['Swamp', 'Swamp', 'Swamp'], []] });
    tg.choose('modo', ['Descarte até duas cartas e compre esse número de cartas']).choose('Descarte', ['Plains']);
    tg.cast('Cathartic Pyre').resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Island', 'Swamp']);
  });
});
