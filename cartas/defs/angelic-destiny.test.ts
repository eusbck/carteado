import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

describe('Angelic Destiny', () => {
  it('+4/+4, voar, primeiro golpe e Angel; volta à mão quando a criatura encantada morre', () => {
    const tg = setup({ battlefield: [['Wall of Omens', { name: 'Angelic Destiny', attachTo: 'Wall of Omens' }, 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []] });
    const w = tg.bf('Wall of Omens');
    expect(tg.pt(w)).toEqual([4, 8]);
    expect(hasKw(tg.g, w, 'flying') && hasKw(tg.g, w, 'first strike')).toBe(true);
    expect(chars(tg.g, w).subtypes).toContain('Angel');
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolve().resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Angelic Destiny']);
  });
});
