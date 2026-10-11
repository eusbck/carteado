import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Red Ghost, Intangible Genius';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('amparo {2}; na segunda carta comprada no turno, cria um Ape Villain 3/3 vermelho com ímpeto', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 3]);
    expect(hasKw(tg.g, id, 'ward')).toBe(true);
    runEffect(tg, draw(tg.g, 0, 2));
    tg.resolveAll();
    const [macaco] = tg.all('Ape Villain');
    expect(tg.pt(macaco)).toEqual([3, 3]);
    expect(hasKw(tg.g, macaco, 'haste')).toBe(true);
  });

  it('não pode ser bloqueado', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Indomitable Ancients']], library: [lib, lib] });
    const id = tg.bf(N);
    tg.attack([[N, 1], ['Elvish Mystic', 1]]).passTo('declareBlockers');
    const cands = blockCandidates(tg.g, 1);
    expect(cands.some((b) => b.canBlock.includes(id))).toBe(false);
    expect(cands.some((b) => b.canBlock.includes(tg.bf('Elvish Mystic')))).toBe(true);
  });
});
