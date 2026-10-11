import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Gruff Triplets';

describe(N, () => {
  it('entrando sem ser ficha, cria duas cópias; as cópias não criam outras', () => {
    const tg = setup({ battlefield: [Array(6).fill('Forest'), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const todas = tg.all(N);
    expect(todas).toHaveLength(3);
    expect(todas.filter((id) => tg.state.objects[id].isToken)).toHaveLength(2);
    for (const id of todas) {
      expect(tg.pt(id)).toEqual([3, 3]);
      expect(hasKw(tg.g, id, 'trample')).toBe(true);
    }
  });

  it('morrendo, põe marcadores +1/+1 iguais à força dela em cada Gruff Triplets que você controla', () => {
    const tg = setup({ battlefield: [Array(6).fill('Forest'), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const original = tg.all(N).find((id) => !tg.state.objects[id].isToken)!;
    removeCard(tg, original);
    tg.resolveAll();
    const restantes = tg.all(N);
    expect(restantes).toHaveLength(2);
    for (const id of restantes) expect(tg.pt(id)).toEqual([6, 6]);
  });
});