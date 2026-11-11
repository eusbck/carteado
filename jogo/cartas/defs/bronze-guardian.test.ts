import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Bronze Guardian';

describe(N, () => {
  it('CR 604.3: a força conta os artefatos que você controla, também com a carta fora do campo', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Silver Myr', 'Forest'], ['Sol Ring']], hand: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'double strike')).toBe(true);
    // na mão, conta os mesmos três artefatos do campo
    expect(chars(tg.g, tg.find(N, 'hand', 0)!).power).toBe(3);
  });

  it('os outros artefatos que você controla têm resguardo {2}; os de outros jogadores e os não artefatos não', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Silver Myr', 'Elvish Mystic'], ['Sol Ring']] });
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'ward')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Sol Ring', 0), 'ward')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Sol Ring', 1), 'ward')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'ward')).toBe(false);
  });

  it('CR 113.7a: o resguardo disparado anula a mágica mesmo que Bronze Guardian saia do campo antes', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], ['Mountain']], hand: [[], ['Lightning Bolt']] });
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    tg.yes('resguardo', false).choose('alvo', ['Silver Myr']).cast('Lightning Bolt');
    tg.settle();
    // o raio e o gatilho de resguardo estão na pilha
    expect(tg.state.zones.stack).toHaveLength(2);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.find('Lightning Bolt', 'graveyard', 1)).not.toBeNull();
  });
});
