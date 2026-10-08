import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Bag of Holding', () => {
  it('exila a carta descartada e a devolve quando sacrificada', () => {
    const tg = setup({ battlefield: [['Bag of Holding', 'Sol Ring', 'Sol Ring', 'Sol Ring'], []], hand: [['Plains'], []], library: [['Island', 'Forest'], []] });
    tg.choose('Descarte', ['Plains']).activate('Bag of Holding', 'Compre').resolve();
    tg.resolve(); // gatilho de descarte
    expect(tg.names(0, 'exile')).toEqual(['Plains']);
    tg.state.objects[tg.bf('Bag of Holding')].tapped = false;
    tg.passTo('main2');
    expect(tg.state.zones.exile.length).toBe(1);
  });
  it('se a carta já saiu do cemitério, fica onde está', () => {
    const tg = setup({ battlefield: [['Bag of Holding', 'Sol Ring'], []], hand: [['Plains'], []], library: [['Island'], []] });
    tg.choose('Descarte', ['Plains']).activate('Bag of Holding', 'Compre').resolve();
    // tira a carta do cemitério antes de o gatilho resolver
    const id = tg.find('Plains', 'graveyard')!;
    tg.state.zones.graveyard[0].splice(tg.state.zones.graveyard[0].indexOf(id), 1);
    tg.state.objects[id].zone = 'library';
    tg.state.zones.library[0].push(id);
    tg.g.bump();
    tg.resolve();
    expect(tg.state.zones.exile.length).toBe(0);
  });
  it('compra e descarta na mesma resolução', () => {
    const tg = setup({ battlefield: [['Bag of Holding', 'Sol Ring'], []], hand: [[], []], library: [['Island'], []] });
    tg.choose('Descarte', ['Island']).activate('Bag of Holding', 'Compre').resolve();
    expect(tg.state.zones.hand[0].length).toBe(0);
  });
  it('os itens de uma Bag que saiu do campo ficam no exílio para sempre', () => {
    const tg = setup({ battlefield: [['Bag of Holding', 'Sol Ring'], ['Swamp', 'Swamp']], hand: [['Plains'], []], library: [['Island'], []] });
    tg.choose('Descarte', ['Plains']).activate('Bag of Holding', 'Compre').resolve().resolve();
    expect(tg.names(0, 'exile')).toEqual(['Plains']);
  });
});
