import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Night Scythe';

describe(N, () => {
  it('voar; ao entrar cria um Necron Warrior 2/2; tripular 2', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Indomitable Ancients'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(tg.pt(tg.bf('Necron Warrior'))).toEqual([2, 2]);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(isCreature(tg.g, tg.bf(N))).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([3, 1]);
  });
});