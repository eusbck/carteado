import { describe, expect, it } from 'vitest';
import { isType } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The War in Heaven';

describe(N, () => {
  it('I: compra três e perde 3 de vida', () => {
    const tg = setup({ battlefield: [Array(6).fill('Swamp'), []], hand: [[N], []], library: [Array(5).fill('Island'), ['Island']] });
    const vida = tg.life(0);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.life(0)).toBe(vida - 3);
  });

  it('III: devolve até três criaturas com valor de mana total até 8, com marcador de necroderme e como artefatos', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: N, counters: { lore: 2 } }], []], graveyard: [['Serra Angel', 'Elvish Mystic', 'Wall of Omens', 'Shard of the Void Dragon'], []], library: [Array(3).fill('Island'), Array(3).fill('Island')] });
    tg.choose('valor de mana total 8 ou menos', ['Serra Angel', 'Elvish Mystic', 'Wall of Omens']).passTo('main1', 0).resolveAll();
    const anjo = tg.bf('Serra Angel');
    expect(tg.state.objects[anjo].counters.necrodermis).toBe(1);
    expect(isType(tg.g, anjo, 'Artifact')).toBe(true);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Shard of the Void Dragon', N].sort());
  });
});