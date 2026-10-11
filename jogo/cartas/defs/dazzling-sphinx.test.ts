import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dazzling Sphinx';

describe(N, () => {
  it('causando dano de combate, o jogador exila até uma instantânea ou feitiço, que você conjura de graça', () => {
    const tg = setup({ battlefield: [[N], []], library: [Array(6).fill('Island'), ['Swamp', 'Consider', 'Island']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.yes('Dazzling Sphinx', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(1, 'graveyard')).toEqual(['Consider']);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.names(1, 'library')).toEqual(['Island', 'Swamp']);
  });

  it('recusando, a carta vai para o fundo do grimório com as outras', () => {
    const tg = setup({ battlefield: [[N], []], library: [Array(6).fill('Island'), ['Swamp', 'Consider', 'Island']] });
    tg.yes('Dazzling Sphinx', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(1, 'library')[0]).toBe('Island');
    expect(tg.names(1, 'library').slice(1).sort()).toEqual(['Consider', 'Swamp']);
  });
});
