import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Noble Hierarch', () => {
  it('exaltado: a criatura que ataca sozinha recebe +1/+1', () => {
    const tg = setup({ battlefield: [['Noble Hierarch', 'Indomitable Ancients'], []], library: [['Island'], ['Island']] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37); // 2 + 1
  });
  it('CR 605: {G}, {W} ou {U}', () => expect(alternativasDeMana('Noble Hierarch')).toEqual(['G', 'U', 'W']));
});
