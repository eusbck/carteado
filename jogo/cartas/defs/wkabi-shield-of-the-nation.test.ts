import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "W'Kabi, Shield of the Nation";

describe(N, () => {
  it('vigilância; atacando com o seu comandante e controlando um artefato de valor 4 ou maior, cria um Rhino 4/4 com atropelar', () => {
    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', commander: true }, 'Thran Dynamo'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'vigilance')).toBe(true);
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    const r = tg.bf('Rhino');
    expect(tg.pt(r)).toEqual([4, 4]);
    expect(hasKw(tg.g, r, 'trample')).toBe(true);
  });

  it('sem o comandante entre as atacantes, ou sem artefato de valor 4, nada', () => {
    const a = setup({ battlefield: [[N, { name: 'Silver Myr', commander: true }, 'Thran Dynamo'], []] });
    a.attack([[N, 1]]).passTo('declareBlockers');
    expect(a.find('Rhino')).toBeNull();
    const b = setup({ battlefield: [[N, { name: 'Silver Myr', commander: true }, 'Sol Ring'], []] });
    b.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(b.find('Rhino')).toBeNull();
  });
});