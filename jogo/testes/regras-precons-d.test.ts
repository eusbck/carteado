// Recursos do motor e de cartas/*.ts acrescentados para o deck Quick Draw (precons-d), com as regras conferidas em
// fontes-oficiais/MagicCompRules-2026-09-25.txt. Planejar tem arquivo próprio (regras-planejar.test.ts).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';

describe('Exilar a mágica em vez de pô-la no cemitério ao resolver (Forger\'s Foundry)', () => {
  it('CR 608.2n, 614.1a: a instantânea marcada vai para o exílio quando resolve', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Opt'], []], library: [['Plains'], []] });
    tg.cast('Opt');
    const id = tg.find('Opt', 'stack')!;
    tg.state.objects[id].stack!.data.exileAsResolves = true;
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Opt']);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });

  it('CR 701.6a: anulada, a mágica marcada vai para o cemitério (a substituição é só da resolução)', () => {
    const tg = setup({ battlefield: [['Island'], ['Island', 'Island']], hand: [['Opt'], ['Counterspell']] });
    tg.cast('Opt');
    tg.state.objects[tg.find('Opt', 'stack')!].stack!.data.exileAsResolves = true;
    tg.pass();
    tg.choose('mágica alvo', ['Opt']).cast('Counterspell').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
    expect(tg.names(0, 'exile')).toEqual([]);
  });
});

describe('Tempestade (cartas/esquilos.ts)', () => {
  it('CR 702.40a: conta as mágicas conjuradas antes dela; as conjuradas em resposta ao gatilho não contam', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Island', 'Island'], []],
      hand: [['Opt', 'Elemental Eruption', 'Opt'], []], library: [Array(5).fill('Plains'), []],
    });
    tg.cast('Opt').resolveAll();
    tg.cast('Elemental Eruption');
    // em resposta ao gatilho da tempestade, mais uma mágica
    tg.cast('Opt').resolve();
    // o gatilho resolve: uma cópia só (pela primeira Opt)
    tg.resolve();
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].isCopy)).toHaveLength(1);
    tg.resolveAll();
    expect(tg.all('Dragon Elemental')).toHaveLength(2);
  });
});
