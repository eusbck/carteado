import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Unnatural Growth';

describe(N, () => {
  it('no início de cada combate, dobra; com duas, a 2/10 vira 8/40', () => {
    const tg = fixture({ battlefield: [[N, N, 'Indomitable Ancients'], ['Elvish Mystic']] });
    tg.passTo('beginCombat');
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([8, 40]);
    // as do oponente não mudam
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    tg.passTo('main2');
    // vale até o fim do turno; no combate do oponente dobra de novo a partir da base
    tg.passTo('beginCombat', 1);
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([8, 40]);
  });
});
