import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Arcane Adaptation';

describe(N, () => {
  it('as criaturas no campo, na mão e no cemitério do dono ganham o tipo; as do oponente não', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Memnite'], ['Ornithopter']], hand: [[N, 'Sage Owl'], []], graveyard: [['Spectral Sailor'], ['Faerie Seer']] });
    tg.choose('Arcane Adaptation: escolha um tipo', ['Ninja']);
    tg.cast(N).resolve();
    expect(chars(tg.g, tg.bf('Memnite')).subtypes).toContain('Ninja');
    expect(chars(tg.g, tg.find('Sage Owl', 'hand', 0)!).subtypes).toContain('Ninja');
    expect(chars(tg.g, tg.find('Spectral Sailor', 'graveyard', 0)!).subtypes).toContain('Ninja');
    expect(chars(tg.g, tg.bf('Ornithopter')).subtypes).not.toContain('Ninja');
    expect(chars(tg.g, tg.find('Faerie Seer', 'graveyard', 1)!).subtypes).not.toContain('Ninja');
  });
});
