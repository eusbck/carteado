import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Ethersworn Sphinx';
const forests = Array(10).fill('Forest');
const aneis = Array(4).fill('Sol Ring');

describe(N, () => {
  it('CR 702.41a: a afinidade reduz só o custo genérico, {1} por artefato que você controla', () => {
    // {7}{W}{U} com quatro artefatos: {3}{W}{U}; os anéis ficam virados para não contarem como mana
    const virados = aneis.map((name) => ({ name, tapped: true }));
    const tg = setup({ battlefield: [[...virados, 'Plains', 'Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [forests, forests] });
    expect(tg.canCast(N)).toBe(true);
    const sem = setup({ battlefield: [['Plains', 'Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [forests, forests] });
    expect(sem.canCast(N)).toBe(false);
    // as cores continuam obrigatórias, por mais artefatos que haja
    const semCor = setup({ battlefield: [[...Array(9).fill({ name: 'Sol Ring', tapped: true }), 'Forest', 'Forest'], []], hand: [[N], []], library: [forests, forests] });
    expect(semCor.canCast(N)).toBe(false);
  });

  it('CR 702.85a: a cascata usa o valor de mana 9, mesmo pagando menos pela afinidade', () => {
    // Zetalpa tem valor de mana 8, menor que 9: é conjurada de graça
    const virados = aneis.map((name) => ({ name, tapped: true }));
    const tg = setup({ battlefield: [[...virados, 'Plains', 'Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Forest', 'Zetalpa, Primal Dawn', ...forests], forests] });
    tg.yes('Cascata', true).cast(N).resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
  });
});
