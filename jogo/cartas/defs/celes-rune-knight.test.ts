import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const CELES = 'Celes, Rune Knight';
const mana = ['Mountain', 'Plains', 'Swamp', 'Swamp'];

describe(CELES, () => {
  it('descarta duas e compra três', () => {
    const tg = setup({ battlefield: [mana, []], hand: [[CELES, 'Island', 'Forest', 'Plains'], []], library: [['Swamp', 'Swamp', 'Swamp'], []] });
    tg.choose('descarte quantas', ['Island', 'Forest']).cast(CELES).resolve().resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Plains', 'Swamp', 'Swamp', 'Swamp']);
  });
  it('pode descartar nenhuma e só comprar uma', () => {
    const tg = setup({ battlefield: [mana, []], hand: [[CELES, 'Island'], []], library: [['Swamp'], []] });
    tg.choose('descarte quantas', []).cast(CELES).resolve().resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Swamp']);
  });
  it('criatura vinda do cemitério: +1/+1 em cada criatura sua', () => {
    const tg = setup({ battlefield: [[CELES, 'Swamp'], []], graveyard: [['Wall of Omens'], []], hand: [['Reanimate'], []], library: [['Island'], []] });
    tg.choose('carta de criatura alvo', ['Wall of Omens']).cast('Reanimate').resolve().resolveAll();
    expect(tg.pt(tg.bf(CELES))).toEqual([5, 5]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
  });
});
