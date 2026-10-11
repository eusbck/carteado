import { describe, expect, it } from 'vitest';
import { enterCard } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Breaching Dragonstorm';
const montanhas = ['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'];
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('exila até uma carta que não é terreno e a conjura de graça durante a resolução', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Island', 'Swamp', 'Sol Ring', ...forests], forests] });
    tg.yes(N, true).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // os terrenos exilados antes dela continuam no exílio
    expect(tg.names(0, 'exile')).toEqual(['Island', 'Swamp']);
    expect(tg.state.zones.library[0]).toHaveLength(10);
    expect(tg.find(N)).not.toBeNull();
  });

  it('sem conjurar, a carta vai para a mão', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Island', 'Sol Ring', ...forests], forests] });
    tg.yes(N, false).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'exile')).toEqual(['Island']);
  });

  it('quando um Dragon que você controla entra, volta para a mão do dono; conjurar um Dragon com ela mesma a devolve', () => {
    const tg = setup({ battlefield: [[N], []], library: [forests, forests] });
    enterCard(tg, 'Elvish Mystic', 0);
    enterCard(tg, 'Goldspan Dragon', 1);
    tg.resolveAll();
    expect(tg.find(N)).not.toBeNull();
    enterCard(tg, 'Goldspan Dragon', 0);
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'hand')).toEqual([N]);

    const combo = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Rapacious Dragon', ...forests], forests] });
    combo.yes(N, true).cast(N).resolveAll();
    expect(combo.find('Rapacious Dragon')).not.toBeNull();
    expect(combo.names(0, 'hand')).toEqual([N]);
  });
});
