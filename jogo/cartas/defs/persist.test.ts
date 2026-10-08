import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Persist', () => {
  it('volta com um marcador -1/-1; lendária não pode ser alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Persist'], []], graveyard: [['Wall of Omens', 'Glissa Sunslayer'], []], library: [['Island'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('não lendária') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.cast('Persist').resolve().resolveAll();
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
  });
});
