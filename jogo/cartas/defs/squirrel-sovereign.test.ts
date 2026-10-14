import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Squirrel Sovereign';

describe(NOME, () => {
  it('os outros Squirrels que você controla recebem +1/+1; ele mesmo e os do oponente não', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Squirrel', token: true }], [{ name: 'Squirrel', token: true }]] });
    expect(tg.pt(tg.bf('Squirrel', 0))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Squirrel', 1))).toEqual([1, 1]);
    expect(tg.pt(tg.bf(NOME))).toEqual([2, 2]);
  });
});
