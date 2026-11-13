import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Hearthhull, the Worldseed';

describe(N, () => {
  it('com Exploration, a habilidade de 2+ deixa jogar três terrenos no turno', () => {
    const tg = setup({
      battlefield: [[{ name: N, counters: { charge: 2 } }, 'Exploration', 'Swamp', 'Mountain'], []],
      hand: [['Forest', 'Forest', 'Forest'], []],
      library: [['Plains', 'Island', 'Plains'], []],
    });
    tg.choose('Sacrifique', ['Swamp']).activate(N, 'Compre').resolve();
    expect(tg.names(0, 'hand').filter((n) => n !== 'Forest').sort()).toEqual(['Island', 'Plains']);
    tg.play('Forest').play('Forest').play('Forest');
    expect(tg.all('Forest').length).toBe(3);
    // sem 8 marcadores, sacrificar o terreno não faz os oponentes perderem vida
    expect(tg.life(1)).toBe(40);
  });

  it('sem 2 marcadores, não tem a habilidade de sacrificar', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 1 } }, 'Swamp', 'Mountain'], []] });
    expect(() => tg.activate(N, 'Compre')).toThrow();
  });

  it('com 8+, é criatura com voar, vigilância e ímpeto, e cada terreno sacrificado tira 2 de vida de cada oponente', () => {
    const tg = setup({ players: 3, battlefield: [[{ name: N, counters: { charge: 8 } }, 'Swamp', 'Mountain'], [], []], library: [['Plains', 'Island'], [], []] });
    const h = tg.bf(N);
    expect(isCreature(tg.g, h)).toBe(true);
    expect(tg.pt(h)).toEqual([6, 7]);
    for (const k of ['flying', 'vigilance', 'haste']) expect(hasKw(tg.g, h, k)).toBe(true);
    tg.choose('Sacrifique', ['Swamp']).activate(N, 'Compre');
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.life(2)).toBe(38);
    expect(tg.life(0)).toBe(40);
  });
});
