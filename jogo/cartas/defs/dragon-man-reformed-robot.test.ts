import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Dragon Man, Reformed Robot';

describe(N, () => {
  it('voar; a força é o maior valor de mana entre as suas permanentes que não são criaturas e as cartas que não são de criatura no seu cemitério', () => {
    // Sol Ring (1) no campo; Hex (6) no cemitério; Zetalpa (8) é criatura e não conta
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Zetalpa, Primal Dawn'], []], graveyard: [['Hex', 'Zetalpa, Primal Dawn'], []] });
    const id = tg.bf(N);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.pt(id)).toEqual([6, 5]);
    const so = setup({ battlefield: [[N, 'Sol Ring'], ['Mind\'s Dilation']] });
    expect(so.pt(so.bf(N))).toEqual([1, 5]);
    const nada = setup({ battlefield: [[N], []] });
    expect(nada.pt(nada.bf(N))).toEqual([0, 5]);
  });

  it('pode ser conjurado do cemitério descartando uma carta além dos outros custos', () => {
    const tg = setup({ battlefield: [['Plains', 'Island', 'Island', 'Island'], []], hand: [['Forest'], []], graveyard: [[N], []] });
    tg.choose('Descarte', ['Forest']).cast(N, 'graveyard').resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    expect(tg.names(0, 'hand')).toEqual([]);
  });

  it('sem carta na mão para descartar, não pode ser conjurado do cemitério', () => {
    const tg = setup({ battlefield: [['Plains', 'Island', 'Island', 'Island'], []], graveyard: [[N], []] });
    expect(() => tg.cast(N, 'graveyard')).toThrow();
  });
});
