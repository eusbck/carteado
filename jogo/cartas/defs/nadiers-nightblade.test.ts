import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, exile } from '../../motor/api.ts';

const NOME = "Nadier's Nightblade";

describe(NOME, () => {
  it('cada ficha sua que sai do campo: cada oponente perde 1 e você ganha 1; ficha do oponente não conta', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Squirrel', token: true }, { name: 'Food', token: true }], [{ name: 'Squirrel', token: true }]] });
    tg.run(destroy(tg.g, [tg.bf('Squirrel', 0)]));
    tg.run(exile(tg.g, [tg.bf('Food')]));
    tg.run(destroy(tg.g, [tg.bf('Squirrel', 1)]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.life(0)).toBe(42);
  });
});
