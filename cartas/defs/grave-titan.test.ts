import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Grave Titan', () => {
  it('tem toque mortífero; ao entrar cria duas fichas Zombie 2/2 pretas', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Swamp')], []], hand: [['Grave Titan'], []] });
    tg.cast('Grave Titan').resolveAll();
    expect(hasKw(tg.g, tg.bf('Grave Titan'), 'deathtouch')).toBe(true);
    const z = tg.all('Zombie');
    expect(z.length).toBe(2);
    expect(z.every((id) => tg.state.objects[id].def === 'Zombie 2/2' && tg.state.objects[id].controller === 0)).toBe(true);
  });

  it('ao atacar, cria mais duas (as fichas não entram atacando)', () => {
    const tg = setup({ battlefield: [['Grave Titan'], []] });
    tg.attack([['Grave Titan', 1]]).passTo('declareBlockers');
    const z = tg.all('Zombie');
    expect(z.length).toBe(2);
    expect(tg.state.combat?.attackers.map((a) => a.id)).toEqual([tg.bf('Grave Titan')]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(34);
  });
});
