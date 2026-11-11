import { describe, expect, it } from 'vitest';
import { chars, controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Borg Queen';

describe(N, () => {
  it('ao entrar, o oponente exila do topo até uma criatura; ela é assimilada e o resto vai para o fundo', () => {
    const tg = setup({
      battlefield: [[...Array(5).fill('Plains'), 'Island', 'Swamp'], []],
      hand: [[N], []],
      library: [[...Array(10).fill('Forest')], ['Island', 'Swamp', 'Wall of Omens', 'Mountain', 'Island']],
    });
    tg.cast(N).resolveAll();
    const muro = tg.bf('Wall of Omens');
    expect(controllerOf(tg.g, muro)).toBe(0);
    const ch = chars(tg.g, muro);
    expect(ch.types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(ch.subtypes).toEqual(['Borg']);
    expect(tg.state.objects[muro].counters['+1/+1']).toBe(1);
    // Wall of Omens 0/4 + marcador +1/+1 + a Rainha (+2/+2 nas criaturas artefato)
    expect(tg.pt(muro)).toEqual([3, 7]);
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
    // o Muro entrou e disparou a compra dele para quem o controla agora
    const lib1 = tg.state.zones.library[1].map((id) => tg.state.objects[id].def);
    expect(lib1.slice(0, 2)).toEqual(['Mountain', 'Island']);
    expect([...lib1.slice(2)].sort()).toEqual(['Island', 'Swamp']);
    expect(tg.names(1, 'exile')).toEqual([]);
  });

  it('ao atacar também assimila; sem criatura no grimório, tudo vai para o fundo', () => {
    const tg = setup({ battlefield: [[N], []], library: [[...Array(10).fill('Forest')], ['Island', 'Swamp']] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.zones.library[1]).toHaveLength(2);
    expect(tg.names(1, 'exile')).toEqual([]);
  });
});
