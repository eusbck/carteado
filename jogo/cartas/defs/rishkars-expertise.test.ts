import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Rishkar's Expertise";
const terrenos = Array(6).fill('Forest');

describe(N, () => {
  it('compra cartas iguais à maior força e conjura de graça uma das compradas', () => {
    const tg = setup({ battlefield: [['Ripjaw Raptor', 'Indomitable Ancients', ...terrenos], []], hand: [[N], []], library: [['Forest', 'Island', 'Ripjaw Raptor', 'Gigantosaurus', 'Plains'], []] });
    let oferecidas: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('valor de mana 5 ou menos') ? (oferecidas = d.items.map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Ripjaw Raptor')!.id] }) : null));
    tg.yes('Conjurar', true);
    tg.cast(N).resolve();
    // comprou 4 (a força do Ripjaw Raptor); os terrenos não são oferecidos, o Gigantosaurus (valor de mana 5) é
    expect(oferecidas.sort()).toEqual(['Gigantosaurus', 'Ripjaw Raptor']);
    tg.resolveAll();
    expect(tg.all('Ripjaw Raptor')).toHaveLength(2);
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Gigantosaurus', 'Island']);
    expect(tg.state.zones.library[0]).toHaveLength(1);
  });

  it('sem criaturas, não compra, mas ainda pode conjurar uma mágica de graça', () => {
    const tg = setup({ battlefield: [[...terrenos], []], hand: [[N, 'Ripjaw Raptor'], []], library: [['Forest'], []] });
    tg.choose('valor de mana 5 ou menos', ['Ripjaw Raptor']).yes('Conjurar', true);
    tg.cast(N).resolveAll();
    expect(tg.find('Ripjaw Raptor')).not.toBeNull();
    expect(tg.state.zones.library[0]).toHaveLength(1);
  });

  it('terreno não é oferecido', () => {
    const tg = setup({ battlefield: [[...terrenos], []], hand: [[N, 'Forest'], []] });
    let perguntou = false;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('valor de mana 5 ou menos') ? (perguntou = true, { kind: 'select', ids: [] }) : null));
    tg.cast(N).resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
