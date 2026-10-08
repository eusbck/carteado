import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { manaOptions } from '../../motor/costs.ts';

describe('Cursed Mirror', () => {
  it('as habilidades de entrar da criatura copiada disparam; enquanto copia, não tem a habilidade de mana; volta ao normal no fim do turno', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], ['Wall of Omens']], hand: [['Cursed Mirror'], []], library: [['Island', 'Island'], ['Island']] });
    tg.choose('Cursed Mirror: virar', ['Wall of Omens']);
    tg.cast('Cursed Mirror').resolve().resolveAll();
    const m = tg.state.zones.battlefield.find((id) => tg.state.objects[id].def === 'Cursed Mirror')!;
    expect(chars(tg.g, m).name).toBe('Wall of Omens');
    expect(hasKw(tg.g, m, 'haste')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Island']); // "ao entrar" da Wall of Omens
    expect(manaOptions(tg.g, 0).some((o) => o.obj === m)).toBe(false);
    tg.passTo('cleanup');
    expect(chars(tg.g, m).name).toBe('Cursed Mirror');
  });
});
