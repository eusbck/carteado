import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Brainstorm', () => {
  it('compra três e põe duas cartas da mão no topo, na ordem escolhida', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Brainstorm', 'Forest'], []], library: [['Swamp', 'Mountain', 'Plains', 'Wall of Omens'], []] });
    tg.choose('topo do grimório', ['Forest', 'Mountain']).cast('Brainstorm').resolve();
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Mountain', 'Wall of Omens']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Plains', 'Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual(['Brainstorm']);
  });
  it('CR 608.2c: compra três e devolve duas na mesma resolução', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Brainstorm'], []], library: [['Swamp', 'Mountain', 'Plains'], []] });
    let naPilha = false;
    let mao = 0;
    tg.script.push((d, t) => {
      if (d.kind !== 'select' || !d.prompt.includes('topo do grimório')) return null;
      // a escolha acontece com o Brainstorm ainda resolvendo, logo depois das três compras
      naPilha = t.state.zones.stack.some((id) => t.state.objects[id].def === 'Brainstorm');
      mao = t.state.zones.hand[0].length;
      expect(d.min).toBe(2);
      expect(d.max).toBe(2);
      return { kind: 'select', ids: [d.items[2].id, d.items[0].id] };
    });
    tg.cast('Brainstorm').resolve();
    expect(naPilha).toBe(true);
    expect(mao).toBe(3);
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Swamp']);
    expect(tg.names(0, 'hand')).toEqual(['Mountain']);
  });
  it('as cartas devolvidas podem ser as que já estavam na mão', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Brainstorm', 'Sol Ring', 'Forest'], []], library: [['Swamp', 'Mountain', 'Plains'], []] });
    tg.choose('topo do grimório', ['Sol Ring', 'Forest']).cast('Brainstorm').resolve();
    expect(tg.names(0, 'library')).toEqual(['Sol Ring', 'Forest']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Mountain', 'Plains', 'Swamp']);
  });
});
