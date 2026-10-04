import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Despark', () => {
  it('exila permanente com valor de mana 4 ou mais (e não menor)', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp'], ['Zetalpa, Primal Dawn', 'Wall of Omens']], hand: [['Despark'], []] });
    let labels: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana 4')) return null;
      labels = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast('Despark').resolve();
    expect(labels).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.names(1, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
  });
});
