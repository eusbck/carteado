import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { chars } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Changeling Outcast';

describe(N, () => {
  it('é de todos os tipos de criatura e não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']] });
    const id = tg.bf(N);
    expect(chars(tg.g, id).subtypes).toContain('Ninja');
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(id))).toBe(false);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
  });
  it('não pode bloquear', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients'], [N]] });
    const id = tg.bf(N);
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.obj === id)).toBe(false);
  });
});
