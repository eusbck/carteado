import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

describe('Grand Crescendo', () => {
  it('cria X Citizens 1/1 verdes e brancos; as criaturas que você controla ganham indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Grand Crescendo'], []] });
    tg.number('valor de X', 2).cast('Grand Crescendo').resolve();
    const fichas = tg.all('Citizen');
    expect(fichas.length).toBe(2);
    expect(tg.pt(fichas[0])).toEqual([1, 1]);
    expect([...chars(tg.g, fichas[0]).colors].sort()).toEqual(['G', 'W']);
    for (const id of [...fichas, tg.bf('Wall of Omens')]) expect(hasKw(tg.g, id, 'indestructible')).toBe(true);
    // a criatura do oponente não ganha
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(false);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(false);
  });

  it('criatura que entra depois da resolução não ganha indestrutível (CR 611.2c)', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Forest'], []], hand: [['Grand Crescendo', 'Elvish Mystic'], []] });
    tg.number('valor de X', 0).cast('Grand Crescendo').resolve();
    tg.cast('Elvish Mystic').resolve();
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'indestructible')).toBe(false);
  });
});
