import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = "Elenda's Hierophant";

describe(N, () => {
  it('voar; cresce a cada ganho de vida; morrendo, cria X Vampires 1/1 com vínculo com a vida, X igual à força dela', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    gainLife(tg.g, 0, 2, null);
    tg.refresh().resolveAll();
    gainLife(tg.g, 0, 2, null);
    tg.refresh().resolveAll();
    expect(tg.pt(id)).toEqual([3, 3]);
    removeCard(tg, id);
    tg.resolveAll();
    const fichas = tg.all('Vampire');
    expect(fichas).toHaveLength(3);
    for (const f of fichas) {
      expect(tg.pt(f)).toEqual([1, 1]);
      expect(hasKw(tg.g, f, 'lifelink')).toBe(true);
    }
  });
});