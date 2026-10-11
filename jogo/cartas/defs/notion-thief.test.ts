import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Notion Thief';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('lampejo; a compra normal do turno do oponente fica com ele, e as outras compras dele vêm para você', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 1]);
    expect(hasKw(tg.g, id, 'flash')).toBe(true);
    tg.passTo('main1', 1);
    // a primeira compra da etapa de compra dele não é substituída
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([0, 1]);
    runEffect(tg, draw(tg.g, 1, 2));
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([2, 1]);
    // as suas compras não mudam
    runEffect(tg, draw(tg.g, 0, 1));
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([3, 1]);
  });

  it('com um Notion Thief de cada lado, quem compraria é quem compra', () => {
    const tg = setup({ battlefield: [[N], [N]], library: [lib, lib] });
    runEffect(tg, draw(tg.g, 1, 1));
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([0, 1]);
  });
});
