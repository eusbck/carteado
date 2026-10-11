import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Helm of the Host';
const Z = 'Zetalpa, Primal Dawn';

describe(N, () => {
  it('no início do combate no seu turno, cria uma cópia não lendária da criatura equipada, com ímpeto', () => {
    const tg = setup({ battlefield: [[Z, { name: N, attachTo: Z }], []] });
    tg.passTo('declareAttackers', 0);
    const todas = tg.all(Z);
    expect(todas).toHaveLength(2);
    const ficha = todas.find((id) => tg.state.objects[id].isToken)!;
    expect(chars(tg.g, ficha).supertypes).not.toContain('Legendary');
    expect(hasKw(tg.g, ficha, 'haste')).toBe(true);
    expect(tg.pt(ficha)).toEqual([4, 8]);
    // a regra das lendas não se aplica: as duas ficam
    tg.passTo('main2', 0);
    expect(tg.all(Z)).toHaveLength(2);
  });

  it('sem criatura equipada, nenhuma ficha é criada', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    tg.passTo('declareAttackers', 0);
    expect(tg.all('Silver Myr')).toHaveLength(1);
  });
});