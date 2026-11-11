import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Extraction Integrant';

describe(N, () => {
  it('as criaturas artefato têm ameaçar; cada criatura que bloqueia uma delas recebe -1/-1 até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }], ['Wall of Omens', 'Indomitable Ancients']] });
    const borg = tg.bf('Borg');
    expect(hasKw(tg.g, borg, 'menace')).toBe(true);
    tg.attack([[borg, 1]]);
    tg.block([['Wall of Omens', borg], ['Indomitable Ancients', borg]]);
    tg.passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([1, 9]);
  });
});
