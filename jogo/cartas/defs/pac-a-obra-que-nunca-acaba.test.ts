import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { controllerOf, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'PAC, a Obra que Nunca Acaba';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('as suas fichas de criatura têm ímpeto; as outras criaturas não', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []], library: [lib, lib] });
    const [ficha] = tg.run(createTokens(tg.g, 0, 'Eleitor', 1));
    expect(hasKw(tg.g, ficha, 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'haste')).toBe(false);
  });

  it('com cinco fichas na etapa final, ganha o controle de uma permanente barata de um oponente', () => {
    const tg = setup({ battlefield: [[N], ['Sol Ring', 'Indomitable Ancients']], library: [lib, lib] });
    tg.run(createTokens(tg.g, 0, 'Eleitor', 5));
    tg.choose('permanente alvo', ['Sol Ring']);
    tg.passTo('upkeep', 1);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Indomitable Ancients'))).toBe(1);
  });

  it('com quatro fichas, nada acontece', () => {
    const tg = setup({ battlefield: [[N], ['Sol Ring']], library: [lib, lib] });
    tg.run(createTokens(tg.g, 0, 'Eleitor', 4));
    tg.passTo('upkeep', 1);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });
});
