import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Pintou um Clima';
const A = 'Indomitable Ancients';
const lib = Array(12).fill('Island');

describe(N, () => {
  it('na manutenção de quem controla a criatura encantada, ele perde 1 e você ganha 1', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: A }], [A]], library: [lib, lib] });
    tg.passTo('main1', 1);
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
    // na sua manutenção, nada
    tg.passTo('main1', 0);
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });

  it('a criatura encantada não pode bloquear', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: A }, 'Elvish Mystic'], [A, 'Llanowar Elves']], library: [lib, lib] });
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    const bloqueadores = blockCandidates(tg.g, 1).map((x) => x.obj);
    expect(bloqueadores).not.toContain(tg.bf(A));
    expect(bloqueadores).toContain(tg.bf('Llanowar Elves'));
  });
});
