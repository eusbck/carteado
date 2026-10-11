import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';
import { ehComandanteDe } from '../wakanda.ts';

const N = 'Everett K. Ross, Hapless Attaché';

describe(N, () => {
  it('as criaturas comandantes que você controla recebem +1/+1 e têm vínculo com a vida', () => {
    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', commander: true }, 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 3]);
    const cmd = tg.bf('Silver Myr');
    expect(ehComandanteDe(tg.g, cmd, 0)).toBe(true);
    expect(tg.pt(cmd)).toEqual([2, 2]);
    expect(hasKw(tg.g, cmd, 'lifelink')).toBe(true);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });

  it('um oponente atacando você com duas ou mais criaturas: você compra uma carta', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Silver Myr', 'Elvish Mystic', 'Indomitable Ancients']], library: [['Island', 'Island'], ['Forest', 'Forest']] });
    tg.attack([['Silver Myr', 0], ['Elvish Mystic', 0]]).passTo('declareBlockers');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    const um = setup({ active: 1, battlefield: [[N], ['Silver Myr']], library: [['Island'], ['Forest', 'Forest']] });
    um.attack([['Silver Myr', 0]]).passTo('declareBlockers');
    expect(um.names(0, 'hand')).toEqual([]);
  });
});