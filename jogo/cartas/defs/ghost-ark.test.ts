import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ghost Ark';

describe(N, () => {
  it('tripulado, as cartas de criatura artefato do seu cemitério ganham desenterrar {3} até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Silver Myr', 'Elvish Mystic'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(() => tg.activate('Silver Myr', 'Desenterrar')).toThrow();
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(() => tg.activate('Elvish Mystic', 'Desenterrar')).toThrow();
    tg.activate('Silver Myr', 'Desenterrar').resolveAll();
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.names(0, 'exile')).toEqual(['Silver Myr']);
  });
});