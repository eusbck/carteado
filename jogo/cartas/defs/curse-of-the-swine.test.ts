import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Curse of the Swine';

describe(N, () => {
  it('exila X criaturas alvo; o controlador de cada uma cria um Boar 2/2 verde', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Slither Blade'], ['Baleful Strix', 'Indomitable Ancients']], hand: [[N], []] });
    tg.number('valor de X', 2).choose('X criaturas alvo', ['Slither Blade', 'Baleful Strix']);
    tg.cast(N).resolveAll();
    expect(tg.find('Slither Blade')).toBeNull();
    expect(tg.find('Baleful Strix')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    const boars = tg.all('Boar');
    expect(boars).toHaveLength(2);
    expect(boars.map((id) => tg.state.objects[id].controller).sort()).toEqual([0, 1]);
    const c = chars(tg.g, boars[0]);
    expect([c.power, c.toughness, c.colors]).toEqual([2, 2, ['G']]);
  });

  it('com X = 0, nada acontece', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Baleful Strix']], hand: [[N], []] });
    tg.number('valor de X', 0);
    tg.cast(N).resolveAll();
    expect(tg.find('Baleful Strix')).not.toBeNull();
    expect(tg.all('Boar')).toEqual([]);
  });
});
