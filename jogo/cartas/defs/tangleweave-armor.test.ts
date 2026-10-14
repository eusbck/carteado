import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Tangleweave Armor';

describe(N, () => {
  it('a Germ recebe +X/+X com X o valor de mana do seu comandante, esteja ele onde estiver', () => {
    // Ghalta (valor de mana 12) na zona de comando
    const tg = setup({ battlefield: [[...Array(4).fill('Forest')], []], hand: [[N], []], command: [['Ghalta, Primal Hunger'], []] });
    tg.cast(N).resolveAll();
    const germe = tg.bf('Phyrexian Germ');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(germe);
    expect(tg.pt(germe)).toEqual([12, 12]);
  });

  it('reequipada em outra criatura, a Germ sem o bônus morre', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Forest'), 'Elvish Mystic'], []], hand: [[N], []], command: [['Ripjaw Raptor'], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Phyrexian Germ'))).toEqual([4, 4]);
    tg.choose('criatura alvo que você controla', ['Elvish Mystic']).activate(N, 'Equipar').resolveAll();
    expect(tg.find('Phyrexian Germ')).toBeNull();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([5, 5]);
  });
});
