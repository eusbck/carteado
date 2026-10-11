import { describe, expect, it } from 'vitest';
import { addEffect, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const E = 'Esper Sentinel';
const grimorios = [['Island', 'Swamp', 'Plains'], ['Forest', 'Forest', 'Forest']];

describe(E, () => {
  it('primeira mágica não criatura de um oponente: compra se ele não pagar {X}', () => {
    const tg = setup({ active: 1, battlefield: [[E], ['Mountain']], hand: [[], ['Sol Ring']], library: grimorios });
    tg.yes('Pagar {1}', false);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('CR 118.12a: o oponente paga {X} e você não compra', () => {
    const tg = setup({ active: 1, battlefield: [[E], ['Mountain', 'Mountain']], hand: [[], ['Sol Ring']], library: grimorios });
    tg.yes('Pagar {1}', true);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Mountain' && tg.state.objects[id].tapped)).toHaveLength(2);
  });
  it('só a primeira do turno: a segunda mágica não criatura não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[E], ['Mountain', 'Mountain', 'Mountain']], hand: [[], ['Sol Ring', 'Mind Stone']], library: grimorios });
    tg.yes('Pagar {1}', false);
    tg.cast('Sol Ring').resolveAll();
    tg.cast('Mind Stone');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('mágica de criatura do oponente e mágica sua não disparam', () => {
    const tg = setup({ battlefield: [[E, 'Mountain'], ['Forest']], hand: [['Sol Ring'], ['Elvish Mystic']], library: grimorios });
    tg.cast('Sol Ring');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    const tg2 = setup({ active: 1, battlefield: [[E], ['Forest']], hand: [[], ['Elvish Mystic']], library: grimorios });
    tg2.cast('Elvish Mystic');
    expect(tg2.state.zones.stack).toHaveLength(1);
  });
  it('com uma mágica não criatura já conjurada no turno, não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[E], ['Mountain']], hand: [[], ['Sol Ring']], library: grimorios });
    // a mágica anterior foi conjurada antes de a Sentinela entrar: o contador do turno já é 1
    tg.state.turnStats[1].noncreatureSpellsCast = 1;
    tg.cast('Sol Ring');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
  it('a força é vista na resolução; fora do campo, vale a última conhecida', () => {
    // +2/+0 depois do disparo: X vira 3
    const tg = setup({ active: 1, battlefield: [[E], ['Mountain', 'Mountain', 'Mountain', 'Mountain']], hand: [[], ['Sol Ring']], library: grimorios });
    let pedido = '';
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith('Pagar')) { pedido = d.prompt; return { kind: 'select', ids: ['yes'] }; } return null; });
    tg.cast('Sol Ring');
    addEffect(tg.g, { source: tg.bf(E), sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [tg.bf(E)], mods: [{ k: 'pt', p: 2, t: 0 }] });
    tg.refresh().resolve();
    expect(pedido).toContain('{3}');
    expect(tg.names(0, 'hand')).toEqual([]);
    // a Sentinela sai do campo antes de resolver: usa a força que ela tinha (1)
    const tg2 = setup({ active: 1, battlefield: [[E], ['Mountain', 'Mountain']], hand: [[], ['Sol Ring']], library: grimorios });
    let pedido2 = '';
    tg2.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith('Pagar')) { pedido2 = d.prompt; return { kind: 'select', ids: ['no'] }; } return null; });
    tg2.cast('Sol Ring');
    tg2.run(destroy(tg2.g, [tg2.bf(E)]));
    tg2.resolve();
    expect(pedido2).toContain('{1}');
    expect(tg2.names(0, 'hand')).toEqual(['Island']);
  });
  it('com força negativa, X é 0 e o oponente ainda pode não pagar', () => {
    const tg = setup({ active: 1, battlefield: [[E], ['Mountain']], hand: [[], ['Sol Ring']], library: grimorios });
    addEffect(tg.g, { source: tg.bf(E), sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [tg.bf(E)], mods: [{ k: 'pt', p: -3, t: 0 }] });
    tg.refresh();
    let pedido = '';
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith('Pagar')) { pedido = d.prompt; return { kind: 'select', ids: ['no'] }; } return null; });
    tg.cast('Sol Ring').resolveAll();
    expect(pedido).toContain('{0}');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
