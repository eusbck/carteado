import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const AUNTIE = 'Auntie Ool, Cursewretch';

describe(AUNTIE, () => {
  it('resguardo: o oponente faz blight 2 numa criatura dele ou a mágica é anulada', () => {
    const tg = setup({ active: 1, battlefield: [[AUNTIE], ['Plains', 'Indomitable Ancients']], hand: [[], ['Swords to Plowshares']], library: [['Island'], ['Island']] });
    tg.yes('Resguardo', true).choose('blight 2', ['Indomitable Ancients']);
    tg.choose('criatura alvo', [AUNTIE]).cast('Swords to Plowshares').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([AUNTIE]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
  });
  it('sem criatura, não dá para fazer blight e a mágica é anulada', () => {
    const tg = setup({ active: 1, battlefield: [[AUNTIE], ['Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.choose('criatura alvo', [AUNTIE]).cast('Swords to Plowshares').resolveAll();
    expect(tg.find(AUNTIE)).not.toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Swords to Plowshares']);
  });
  it('marcadores -1/-1: criatura sua compra; de outro, o controlador perde 1', () => {
    const tg = setup({ battlefield: [[AUNTIE, 'Elvish Mystic', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Blight Rot', 'Blight Rot'], []], library: [['Island'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Blight Rot').resolve().resolveAll();
    expect(tg.life(1)).toBe(39);
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Blight Rot').resolve().resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
