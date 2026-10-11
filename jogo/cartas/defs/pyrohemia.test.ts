import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Pyrohemia';

describe(N, () => {
  it('{R}: 1 de dano a cada criatura e a cada jogador', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], ['Indomitable Ancients', 'Elvish Mystic']] });
    tg.activate(N).resolveAll();
    tg.activate(N).resolveAll();
    expect(tg.life(0)).toBe(38);
    expect(tg.life(1)).toBe(38);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
  });

  it('com uma criatura no campo no início da etapa final, fica; sem nenhuma, é sacrificada', () => {
    const fica = setup({ battlefield: [[N], ['Indomitable Ancients']] });
    fica.passTo('upkeep', 1);
    expect(fica.find(N)).not.toBeNull();
    const sai = setup({ battlefield: [[N], []] });
    sai.passTo('upkeep', 1);
    expect(sai.find(N)).toBeNull();
    expect(sai.names(0, 'graveyard')).toEqual([N]);
  });
});