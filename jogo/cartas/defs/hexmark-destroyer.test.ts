import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hexmark Destroyer';

describe(N, () => {
  it('não pode ser bloqueada por menos de seis criaturas', () => {
    const tg = setup({ battlefield: [[N], ['Wall of Omens', 'Indomitable Ancients']] });
    tg.attack([[N, 1]]);
    expect(() => tg.block([['Wall of Omens', N], ['Indomitable Ancients', N]]).passTo('main2', 0)).toThrow();
  });

  it('desenterrar {4}{B}{B}: volta do cemitério com ímpeto e é exilada na etapa final', () => {
    const tg = setup({ battlefield: [Array(6).fill('Swamp'), []], graveyard: [[N], []] });
    tg.activate(N, 'Desenterrar').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});