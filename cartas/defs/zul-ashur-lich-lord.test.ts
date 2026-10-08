import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ZUL = 'Zul Ashur, Lich Lord';

describe('Zul Ashur, Lich Lord', () => {
  it('{T}: pode conjurar a carta de criatura Zumbi alvo do cemitério neste turno', () => {
    const tg = setup({ battlefield: [[ZUL, 'Swamp'], []], graveyard: [["Stitcher's Supplier", 'Wall of Omens'], []] });
    expect(tg.canCast("Stitcher's Supplier")).toBe(false);
    tg.choose('carta de criatura Zumbi', ["Stitcher's Supplier"]).activate(ZUL).resolve();
    expect(tg.canCast("Stitcher's Supplier")).toBe(true);
    tg.cast("Stitcher's Supplier", '*').resolve();
    expect(tg.find("Stitcher's Supplier")).not.toBeNull();
    expect(tg.find('Swamp')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
  });

  it('só Zumbis: Wall of Omens não pode ser o alvo', () => {
    const tg = setup({ battlefield: [[ZUL], []], graveyard: [['Wall of Omens'], []] });
    expect(() => tg.activate(ZUL)).toThrow(/indisponível/);
  });

  it('paga o custo de mana normal e segue o tempo de feitiço da criatura', () => {
    const tg = setup({ step: 'upkeep', battlefield: [[ZUL, 'Swamp'], []], graveyard: [["Stitcher's Supplier"], []], library: [['Island'], []] });
    tg.choose('carta de criatura Zumbi', ["Stitcher's Supplier"]).activate(ZUL).resolve();
    // na manutenção não dá: criatura só na fase principal, com a pilha vazia (CR 307.1)
    expect(tg.canCast("Stitcher's Supplier")).toBe(false);
    tg.passTo('main1');
    expect(tg.canCast("Stitcher's Supplier")).toBe(true);
    // e paga o custo de mana: com o Swamp virado, não dá
    tg.state.objects[tg.bf('Swamp')].tapped = true;
    tg.refresh();
    expect(tg.canCast("Stitcher's Supplier")).toBe(false);
  });

  it('a permissão acaba no fim do turno', () => {
    const tg = setup({ battlefield: [[ZUL, 'Swamp'], []], graveyard: [["Stitcher's Supplier"], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.choose('carta de criatura Zumbi', ["Stitcher's Supplier"]).activate(ZUL).resolve();
    tg.passTo('upkeep', 1).passTo('main1', 0);
    expect(tg.state.turn.active).toBe(0);
    expect(tg.state.gameOver).toBeNull();
    expect(tg.canCast("Stitcher's Supplier")).toBe(false);
  });

  it('resguardo — pagar 2 de vida: o oponente paga e a mágica resolve', () => {
    const tg = setup({ active: 1, battlefield: [[ZUL], ['Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.yes('Resguardo', true).choose('criatura alvo', [ZUL]).cast('Swords to Plowshares').resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.find(ZUL, 'exile')).not.toBeNull();
  });

  it('resguardo: sem pagar, a mágica é anulada', () => {
    const tg = setup({ active: 1, battlefield: [[ZUL], ['Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.yes('Resguardo', false).choose('criatura alvo', [ZUL]).cast('Swords to Plowshares').resolveAll();
    expect(tg.life(1)).toBe(40);
    expect(tg.find(ZUL)).not.toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Swords to Plowshares']);
  });

  it('CR 119.4: com menos de 2 de vida não dá para pagar', () => {
    const tg = setup({ active: 1, battlefield: [[ZUL], ['Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.state.players[1].life = 1;
    tg.refresh();
    tg.yes('Resguardo', true).choose('criatura alvo', [ZUL]).cast('Swords to Plowshares').resolveAll();
    expect(tg.life(1)).toBe(1);
    expect(tg.find(ZUL)).not.toBeNull();
  });
});
