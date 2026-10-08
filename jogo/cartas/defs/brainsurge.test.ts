import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ILHAS = ['Island', 'Island', 'Island'];

describe('Brainsurge', () => {
  it('compra quatro e põe duas cartas da mão no topo, na ordem escolhida', () => {
    const tg = setup({ battlefield: [ILHAS, []], hand: [['Brainsurge'], []], library: [['Swamp', 'Mountain', 'Plains', 'Forest', 'Wall of Omens'], []] });
    tg.choose('topo do grimório', ['Plains', 'Swamp']).cast('Brainsurge').resolve();
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Swamp', 'Wall of Omens']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Mountain']);
    expect(tg.names(0, 'graveyard')).toEqual(['Brainsurge']);
  });
  it('as cartas devolvidas podem ser as compradas ou as que já estavam na mão', () => {
    const tg = setup({ battlefield: [ILHAS, []], hand: [['Brainsurge', 'Sol Ring'], []], library: [['Swamp', 'Mountain', 'Plains', 'Forest'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('topo do grimório')) return null;
      opcoes = d.items.map((i) => i.label).sort();
      // uma que já estava na mão e uma das compradas
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id, d.items.find((i) => i.label === 'Forest')!.id] };
    });
    tg.cast('Brainsurge').resolve();
    expect(opcoes).toEqual(['Forest', 'Mountain', 'Plains', 'Sol Ring', 'Swamp']);
    expect(tg.names(0, 'library')).toEqual(['Sol Ring', 'Forest']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Mountain', 'Plains', 'Swamp']);
  });
  it('CR 608.2c: as compras e a devolução acontecem na mesma resolução', () => {
    const tg = setup({ battlefield: [ILHAS, []], hand: [['Brainsurge'], []], library: [['Swamp', 'Mountain', 'Plains', 'Forest'], []] });
    let naPilha = false;
    tg.script.push((d, t) => {
      if (d.kind !== 'select' || !d.prompt.includes('topo do grimório')) return null;
      naPilha = t.state.zones.stack.some((id) => t.state.objects[id].def === 'Brainsurge') && t.state.zones.hand[0].length === 4;
      return null;
    });
    tg.cast('Brainsurge').resolve();
    expect(naPilha).toBe(true);
    expect(tg.state.zones.library[0].length).toBe(2);
    expect(tg.state.zones.hand[0].length).toBe(2);
  });
});
