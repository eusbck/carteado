import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const H = "Hazoret's Monument";

describe(H, () => {
  it('mágica de criatura vermelha custa {1} a menos; ao conjurar, pode descartar uma carta para comprar uma', () => {
    const tg = setup({ battlefield: [[H, 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Thunderbreak Regent', 'Island'], []], library: [['Plains'], []] });
    tg.choose('Descarte uma carta', ['Island']);
    tg.cast('Thunderbreak Regent').resolveAll();
    expect(tg.find('Thunderbreak Regent')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
  });
  it('"você pode": sem descartar, não compra', () => {
    const tg = setup({ battlefield: [[H, 'Forest'], []], hand: [['Elvish Mystic', 'Island'], []], library: [['Plains'], []] });
    tg.choose('Descarte uma carta', []);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('mágica de criatura não vermelha dispara, mas não fica mais barata', () => {
    const tg = setup({ battlefield: [[H, 'Forest', 'Plains'], []], hand: [['Elvish Mystic', 'Wall of Omens', 'Island'], []], library: [['Plains', 'Swamp'], []] });
    tg.choose('Descarte uma carta', ['Island']);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.canCast('Wall of Omens')).toBe(false);
  });
  it('mágica de criatura vermelha multicolorida fica mais barata', () => {
    // Excava, the Risen Past {2}{R}{W}: com o monumento, {1}{R}{W}
    const tg = setup({ battlefield: [[H, 'Mountain', 'Plains', 'Island'], []], hand: [['Excava, the Risen Past'], []] });
    expect(tg.canCast('Excava, the Risen Past')).toBe(true);
    const sem = setup({ battlefield: [['Mountain', 'Plains', 'Island'], []], hand: [['Excava, the Risen Past'], []] });
    expect(sem.canCast('Excava, the Risen Past')).toBe(false);
  });
  it('mágica que não é de criatura não dispara nem fica mais barata', () => {
    const tg = setup({ battlefield: [[H, 'Mountain'], []], hand: [['Lightning Bolt', 'Island'], []] });
    tg.cast('Lightning Bolt');
    expect(tg.state.zones.stack).toHaveLength(1);
  });
  it('o gatilho resolve antes da mágica de criatura, mesmo que ela seja anulada', () => {
    const tg = setup({ battlefield: [[H, 'Forest'], []], hand: [['Elvish Mystic', 'Island'], []], library: [['Plains'], []] });
    tg.choose('Descarte uma carta', ['Island']);
    tg.cast('Elvish Mystic');
    const magia = tg.find('Elvish Mystic', 'stack')!;
    tg.resolve();
    expect(tg.state.zones.stack).toEqual([magia]);
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    tg.run(counter(tg.g, magia));
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Elvish Mystic', 'Island']);
  });
});
