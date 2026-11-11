import { describe, expect, it } from 'vitest';
import { chars, controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Gift of Perfection';

describe(N, () => {
  it('cada oponente revela até uma criatura; você assimila uma delas e o resto vai para o fundo', () => {
    const tg = setup({
      players: 3,
      battlefield: [[...Array(5).fill('Island')], [], []],
      hand: [[N], [], []],
      library: [[...Array(10).fill('Forest')], ['Island', 'Zetalpa, Primal Dawn', 'Swamp'], ['Indomitable Ancients', 'Mountain']],
    });
    tg.choose('assimilar', ['Zetalpa, Primal Dawn']).cast(N).resolveAll();
    const z = tg.bf('Zetalpa, Primal Dawn');
    expect(controllerOf(tg.g, z)).toBe(0);
    expect(chars(tg.g, z).types).toContain('Artifact');
    expect(chars(tg.g, z).subtypes).toEqual(['Borg']);
    expect(tg.state.objects[z].counters['+1/+1']).toBe(1);
    // as cartas reveladas que sobraram foram para o fundo; as de baixo continuam por cima
    const lib1 = tg.state.zones.library[1].map((id) => tg.state.objects[id].def);
    expect(lib1).toEqual(['Swamp', 'Island']);
    const lib2 = tg.state.zones.library[2].map((id) => tg.state.objects[id].def);
    expect(lib2).toEqual(['Mountain', 'Indomitable Ancients']);
  });
});
