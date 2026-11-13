import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Parallel Lives';
const bestas = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Beast 4/4');

describe(N, () => {
  it('cria o dobro das fichas sob o seu controle; as do oponente não', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Beast 4/4', 1));
    runEffect(tg, createTokens(tg.g, 1, 'Beast 4/4', 1));
    expect(bestas(tg).filter((id) => tg.state.objects[id].controller === 0).length).toBe(2);
    expect(bestas(tg).filter((id) => tg.state.objects[id].controller === 1).length).toBe(1);
  });
  it('com duas Parallel Lives, quatro vezes as fichas', () => {
    const tg = setup({ battlefield: [[N, N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Beast 4/4', 1));
    expect(bestas(tg).length).toBe(4);
  });
  it('as fichas a mais entram como as originais (viradas)', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Beast 4/4', 1, { tapped: true }));
    expect(bestas(tg).map((id) => tg.state.objects[id].tapped)).toEqual([true, true]);
  });
});
