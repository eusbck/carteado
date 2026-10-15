import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { returnToHand } from '../../motor/actions.ts';

const N = "Forger's Foundry";
const CONJURAR = 'escolha uma mágica para conjurar';

describe(N, () => {
  it('a instantânea paga com a mana dela é exilada ao resolver e depois conjurada de graça pela segunda habilidade', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island', 'Island', 'Island'], []], hand: [['Opt'], []], library: [Array(5).fill('Plains'), []] });
    // só a Foundry paga a Opt
    tg.script.push((d) => (d.kind === 'payment' && d.prompt.includes('Opt') ? { kind: 'payment', activate: { source: d.sources.find((s) => s.label.startsWith(N))!.id } } : null));
    tg.yes('exilar Opt', true).cast('Opt');
    // o gatilho da mana gasta está acima da Opt
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Opt']);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    // desvira a Foundry e usa a segunda habilidade (como feitiço)
    tg.state.objects[tg.bf(N)].tapped = false;
    tg.refresh();
    tg.choose(CONJURAR, ['Opt']).activate(N, 'Você pode conjurar').resolve();
    expect(tg.find('Opt', 'stack')).not.toBeNull();
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
  });

  it('anulada, a mágica marcada vai para o cemitério', () => {
    const tg = setup({ battlefield: [[N], ['Island', 'Island']], hand: [['Opt'], ['Counterspell']] });
    tg.yes('exilar Opt', true).cast('Opt').resolve();
    tg.pass();
    tg.choose('mágica alvo', ['Opt']).cast('Counterspell').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
  });

  it('o gatilho resolve mesmo com a Foundry fora do campo', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Opt'], []], library: [['Plains'], []] });
    tg.yes('exilar Opt', true).cast('Opt');
    tg.run(returnToHand(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Opt']);
  });

  it('a mana gasta numa mágica de criatura não dispara nada', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []], hand: [['Wall of Omens'], []], library: [['Plains'], []] });
    tg.cast('Wall of Omens');
    expect(tg.state.zones.stack).toHaveLength(1);
  });
});
