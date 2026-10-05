import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('The Warring Triad', () => {
  it('deixa de ser criatura e perde o tipo God com menos de oito cartas no cemitério', () => {
    const tg = setup({ battlefield: [['The Warring Triad'], []], graveyard: [Array(7).fill('Island'), []] });
    const t = tg.bf('The Warring Triad');
    expect(chars(tg.g, t).types).toEqual(['Artifact']);
    expect(chars(tg.g, t).subtypes).toEqual([]);
    const tg2 = setup({ battlefield: [['The Warring Triad'], []], graveyard: [Array(8).fill('Island'), []] });
    expect(chars(tg2.g, tg2.bf('The Warring Triad')).types).toEqual(['Artifact', 'Creature']);
  });
  it('não é habilidade de mana; usa a pilha e o jogador alvo escolhe a cor', () => {
    const tg = setup({ battlefield: [['The Warring Triad'], []], library: [['Island'], []] });
    tg.choose('jogador alvo', ['Bruno']);
    tg.activate('The Warring Triad');
    expect(tg.state.zones.stack.length).toBe(1);
    tg.choose('escolha a cor', ['verde']).resolve();
    expect(tg.state.players[1].manaPool.map((m) => m.type)).toEqual(['G']);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
  });
});
