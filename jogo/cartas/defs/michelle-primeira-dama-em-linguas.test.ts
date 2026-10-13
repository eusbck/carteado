import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Michelle, Primeira-Dama em Línguas';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('no primeiro ganho de vida do turno, põe um marcador +1/+1; no segundo, não', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    tg.choose('criatura alvo que você controla', ['Elvish Mystic']);
    gainLife(tg.g, 0, 2, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    gainLife(tg.g, 0, 2, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    expect(tg.life(0)).toBe(44);
  });

  it('o vínculo com a vida dela mesma conta', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(0)).toBe(42);
    expect(tg.pt(tg.bf(N))).toEqual([3, 4]);
  });
});
