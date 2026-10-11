import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Panther Robot';
const vibranium = (n: number) => Array.from({ length: n }, () => ({ name: 'Vibranium', token: true }));

describe(N, () => {
  it('afinidade com artefatos: custa {1} a menos para cada artefato que você controla; alcance e atropelar', () => {
    // seis Vibranium: custa {4}, e eles mesmos geram a mana (só para mágica de artefato)
    const tg = setup({ battlefield: [vibranium(6), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([8, 8]);
    expect(hasKw(tg.g, id, 'reach')).toBe(true);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    const sem = setup({ battlefield: [Array(6).fill('Island'), []], hand: [[N], []] });
    expect(sem.canCast(N)).toBe(false);
  });
});