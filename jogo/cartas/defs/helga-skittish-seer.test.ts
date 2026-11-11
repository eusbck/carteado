import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const H = 'Helga, Skittish Seer';

describe(H, () => {
  it('a mana de Helga é X da mesma cor, só para mágica de criatura de valor 4 ou mais', () => {
    expect(alternativasDeMana(H)).toEqual(['B', 'G', 'R', 'U', 'W']);
    // Helga 1/3 não paga sozinha nem Dragon Whelp ({2}{R}{R}) nem Sol Ring
    const tg = setup({ battlefield: [[{ name: H, counters: { '+1/+1': 3 } }], []], hand: [['Dragon Whelp', 'Elvish Mystic'], []] });
    expect(tg.canCast('Dragon Whelp')).toBe(true);
    expect(tg.canCast('Elvish Mystic')).toBe(false);
  });
  it('conjurar criatura de valor 4 ou mais: compra, ganha 1 de vida e põe um marcador em Helga', () => {
    const tg = setup({ battlefield: [[H, 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Forest'], []], hand: [['Dragon Whelp', 'Elvish Mystic'], []], library: [['Island'], []] });
    tg.cast('Elvish Mystic');
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    tg.cast('Dragon Whelp');
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(41);
    expect(tg.state.objects[tg.bf(H)].counters['+1/+1']).toBe(1);
  });
});
