import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ultron, Unlimited';
const lib = Array(6).fill('Swamp');

describe(N, () => {
  it('voar; ao atacar, trama; pagando {1}, cria um Robot Villain 2/2', () => {
    const tg = setup({ battlefield: [[N, 'Swamp'], []], hand: [['Hex'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.choose('Descarte', ['Hex']).yes('Pagar', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    const [robo] = tg.all('Robot Villain');
    expect(tg.pt(robo)).toEqual([2, 2]);
    expect(tg.life(1)).toBe(37);
  });

  it('sem pagar, não cria a ficha', () => {
    const tg = setup({ battlefield: [[N, 'Swamp'], []], library: [lib, lib] });
    tg.yes('Pagar', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.all('Robot Villain')).toHaveLength(0);
  });
});
