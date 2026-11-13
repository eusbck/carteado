import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Gingerbrute';

describe(N, () => {
  it('{1}: só criaturas com ímpeto podem bloqueá-lo neste turno', () => {
    const tg = setup({ battlefield: [[{ name: N, ready: false }, 'Island'], ['Indomitable Ancients']] });
    const id = tg.bf(N);
    tg.activate(N, 'não pode ser bloqueada').resolve();
    // ímpeto: ataca no turno em que entrou
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(id))).toBe(false);
  });
  it('{2}, {T}, sacrifique: ganha 3 de vida', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []] });
    tg.activate(N, 'ganha 3').resolve();
    expect(tg.life(0)).toBe(43);
    expect(tg.find(N)).toBeNull();
  });
});
