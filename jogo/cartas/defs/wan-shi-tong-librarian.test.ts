import { describe, expect, it } from 'vitest';
import { searchLibrary } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Wan Shi Tong, Librarian';

describe(N, () => {
  it('entra com X marcadores +1/+1 e compra metade de X cartas', () => {
    const tg = setup({ battlefield: [Array(5).fill('Island'), []], hand: [[N], []], library: [Array(3).fill('Island'), ['Island']] });
    tg.number('X', 3).cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    for (const kw of ['flash', 'flying', 'vigilance']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('dispara quando um oponente procura no próprio grimório; você procurando, não', () => {
    const tg = setup({ battlefield: [[N], []], library: [Array(3).fill('Island'), Array(3).fill('Island')] });
    for (let i = 0; i < 2; i++) tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('busca de teste') ? { kind: 'select', ids: [] } : null));
    runEffect(tg, searchLibrary(tg.g, 0, 0, { max: 1, min: 0, prompt: 'busca de teste' }));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    runEffect(tg, searchLibrary(tg.g, 1, 1, { max: 1, min: 0, prompt: 'busca de teste' }));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });
});