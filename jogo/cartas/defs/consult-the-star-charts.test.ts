import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { enterCard, runEffect } from '../../testes/artefatos.ts';
import { addMana, copySpell } from '../../motor/api.ts';

const N = 'Consult the Star Charts';
describe(N, () => {
  it('sem reforço, pega uma dentre X cartas e move o resto para o fundo', () => {
    const tg = setup({ battlefield: [Array(3).fill('Island'), ['Forest']], hand: [[N], []], library: [['Plains', 'Swamp', 'Sol Ring', 'Mountain'], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('para a sua mão', ['Sol Ring']).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'library')[0]).toBe('Mountain');
    expect(tg.names(0, 'library').slice(1).sort()).toEqual(['Plains', 'Swamp']);
  });
  it('com reforço, coloca duas cartas na mão e o resto no fundo em ordem aleatória', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), []], hand: [[N], []], library: [['Plains', 'Swamp', 'Sol Ring', 'Mountain', 'Forest'], []] });
    const antes = [...tg.state.rng];
    tg.choose('custo adicional opcional', ['Pagar: reforço {1}{U}']).choose('para a sua mão', ['Sol Ring', 'Mountain']).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring', 'Mountain']);
    expect(tg.names(0, 'library')[0]).toBe('Forest');
    expect(tg.names(0, 'library').slice(1).sort()).toEqual(['Plains', 'Swamp']);
    expect(tg.state.rng).not.toEqual(antes);
  });
  it('X conta os terrenos na resolução, uma vez só', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Sol Ring'], []], hand: [[N], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain'], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N);
    enterCard(tg, 'Forest', 0);
    tg.choose('para a sua mão', ['Forest']).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.names(0, 'library')[0]).toBe('Mountain');
  });
  it('CR 707.10: copiar a mágica reforçada mantém o reforço', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), []], hand: [[N], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain', 'Sol Ring', 'Counterspell'], []] });
    tg.choose('custo adicional opcional', ['Pagar: reforço {1}{U}']).cast(N);
    runEffect(tg, copySpell(tg.g, tg.state.zones.stack[0], 0));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(4);
  });
  it('com zero terrenos, não coloca cartas na mão', () => {
    const tg = setup({ hand: [[N], []], library: [['Sol Ring'], []] });
    addMana(tg.g, 0, ['U', 'U']);
    tg.refresh();
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')).toEqual(['Sol Ring']);
  });
});
