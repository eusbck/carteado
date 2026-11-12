import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Adrix and Nev, Twincasters';
const bestas = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Beast 4/4');

describe(N, () => {
  it('as fichas a mais entram como as originais (viradas)', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Beast 4/4', 1, { tapped: true }));
    expect(bestas(tg).map((id) => tg.state.objects[id].tapped)).toEqual([true, true]);
  });
  it('com Parallel Lives, quatro vezes as fichas', () => {
    const tg = setup({ battlefield: [[N, 'Parallel Lives'], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Beast 4/4', 1));
    expect(bestas(tg).length).toBe(4);
  });
});
