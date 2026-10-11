import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Archangel of Strife';

describe(N, () => {
  it('cada jogador escolhe guerra ou paz, o ativo primeiro', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Plains'), 'Silver Myr'], ['Indomitable Ancients']], hand: [[N], []] });
    const quem: number[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('guerra')) quem.push(d.player); return null; });
    tg.choose('guerra', ['Guerra']).choose('guerra', ['Paz']);
    tg.cast(N).resolveAll();
    expect(quem).toEqual([0, 1]);
    const id = tg.bf(N);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    // ruling 2: ele mesmo entra como 9/6
    expect(tg.pt(id)).toEqual([9, 6]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 1]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 13]);
  });

  it('saindo do campo, o bônus acaba', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Plains'), 'Silver Myr'], []], hand: [[N], []] });
    tg.choose('guerra', ['Paz']).choose('guerra', ['Paz']);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 4]);
    removeCard(tg, tg.bf(N));
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });
});