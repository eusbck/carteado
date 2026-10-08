import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const CB = 'Cryptbreaker';
const zumbi = { name: 'Zombie 2/2', token: true };

describe('Cryptbreaker', () => {
  it('{1}{B}, {T}, descarte uma carta: cria um Zumbi 2/2', () => {
    const tg = setup({ battlefield: [[CB, 'Swamp', 'Swamp'], []], hand: [['Island'], []] });
    tg.activate(CB, 'Descarte').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.all('Zombie 2/2')).toHaveLength(1);
    expect(tg.state.objects[tg.bf(CB)].tapped).toBe(true);
  });

  it('a primeira habilidade tem {T}: não com enjoo de invocação', () => {
    const tg = setup({ battlefield: [[{ name: CB, ready: false }, 'Swamp', 'Swamp'], []], hand: [['Island'], []] });
    expect(() => tg.activate(CB, 'Descarte')).toThrow(/indisponível/);
  });

  it('pode virar o próprio Cryptbreaker e Zumbis com enjoo de invocação', () => {
    const tg = setup({ battlefield: [[{ name: CB, ready: false }, { ...zumbi, ready: false }, { ...zumbi, ready: false }], []], library: [['Forest'], []] });
    tg.choose('Zumbis desvirados', [CB, ...tg.all('Zombie 2/2')]).activate(CB, 'Vire três').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.life(0)).toBe(39);
    for (const id of tg.state.zones.battlefield) expect(tg.state.objects[id].tapped).toBe(true);
  });

  it('só Zumbis contam: com dois Zumbis e outra criatura, não dá', () => {
    const tg = setup({ battlefield: [[CB, zumbi, 'Wall of Omens'], []], library: [['Forest'], []] });
    expect(() => tg.activate(CB, 'Vire três')).toThrow(/indisponível/);
  });
});
