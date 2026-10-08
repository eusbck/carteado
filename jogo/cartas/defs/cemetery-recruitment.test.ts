import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { exile } from '../../motor/api.ts';

describe('Cemetery Recruitment', () => {
  it('devolve a carta de criatura para a mão; não Zombie, não compra', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Cemetery Recruitment'], []], graveyard: [['Wall of Omens', 'Island'], []], library: [['Plains'], []] });
    tg.choose('carta de criatura alvo', ['Wall of Omens']).cast('Cemetery Recruitment').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
  it('se for uma carta Zombie, compra uma carta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Cemetery Recruitment'], []], graveyard: [["Stitcher's Supplier"], []], library: [['Plains'], []] });
    tg.cast('Cemetery Recruitment').resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Plains', "Stitcher's Supplier"]);
    expect(tg.names(0, 'graveyard')).toEqual(['Cemetery Recruitment']);
  });
  it('CR 608.2b: alvo ilegal na resolução, não resolve e não compra', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Cemetery Recruitment'], []], graveyard: [["Stitcher's Supplier"], []], library: [['Plains'], []] });
    tg.cast('Cemetery Recruitment');
    tg.run(exile(tg.g, [tg.find("Stitcher's Supplier", 'graveyard')!]));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.names(0, 'graveyard')).toEqual(['Cemetery Recruitment']);
  });
  it('não pode mirar carta do cemitério de um oponente', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Cemetery Recruitment'], []], graveyard: [[], ["Stitcher's Supplier"]] });
    expect(tg.canCast('Cemetery Recruitment')).toBe(false);
  });
});
