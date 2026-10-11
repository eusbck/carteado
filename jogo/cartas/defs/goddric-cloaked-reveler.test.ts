import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { enterCard, fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Goddric, Cloaked Reveler';

describe(N, () => {
  it('com dois permanentes não terrenos entrando no turno, vira um Dragon 4/4 com voar; no turno seguinte volta ao normal', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
    enterCard(tg, 'Sol Ring', 0);
    enterCard(tg, 'Elvish Mystic', 0);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(chars(tg.g, id).subtypes).toEqual(['Dragon']);
    expect(chars(tg.g, id).supertypes).toContain('Legendary');
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(chars(tg.g, id).subtypes).toEqual(expect.arrayContaining(['Human', 'Noble']));
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
  });

  it('terrenos não contam, e um permanente só não basta', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Mountain'], []] });
    tg.play('Mountain');
    enterCard(tg, 'Sol Ring', 0);
    // o que entra sob o controle do oponente também não conta
    enterCard(tg, 'Sol Ring', 1);
    enterCard(tg, 'Elvish Mystic', 1);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(chars(tg.g, tg.bf(N)).subtypes).not.toContain('Dragon');
  });

  it('os permanentes que entraram não precisam continuar no campo', () => {
    const tg = setup({ battlefield: [[N], []] });
    const a = enterCard(tg, 'Sol Ring', 0)!;
    const b = enterCard(tg, 'Elvish Mystic', 0)!;
    removeCard(tg, a);
    removeCard(tg, b);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });

  it('{R} dá +1/+0 só aos Dragons que você controla na resolução', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Rapacious Dragon', 'Elvish Mystic'], ['Rapacious Dragon']] });
    // sem a celebração, Goddric não tem a habilidade
    expect(() => tg.activate(N)).toThrow();
    enterCard(tg, 'Sol Ring', 0);
    enterCard(tg, 'Sol Ring', 0);
    tg.activate(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([5, 4]);
    expect(tg.pt(tg.bf('Rapacious Dragon', 0))).toEqual([4, 3]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Rapacious Dragon', 1))).toEqual([3, 3]);
    // um Dragon que chega depois não recebe o bônus
    const novo = enterCard(tg, 'Rapacious Dragon', 0)!;
    expect(tg.pt(novo)).toEqual([3, 3]);
  });
});
