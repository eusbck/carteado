import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Bogslither's Embrace", () => {
  it('custo adicional: blight 1; exila a criatura alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Indomitable Ancients'], ['Zetalpa, Primal Dawn']], hand: [["Bogslither's Embrace"], []] });
    tg.choose('custo adicional', ['blight 1']).choose('criatura alvo', ['Zetalpa, Primal Dawn']).choose('(blight 1)', ['Indomitable Ancients']);
    tg.cast("Bogslither's Embrace").resolve();
    expect(tg.names(1, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['-1/-1']).toBe(1);
  });
  it('sem criatura, só dá para pagar {3}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Zetalpa, Primal Dawn']], hand: [["Bogslither's Embrace"], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('custo adicional')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: ['or'] };
    });
    tg.choose('criatura alvo', ['Zetalpa, Primal Dawn']).cast("Bogslither's Embrace").resolve();
    expect(opcoes).toEqual(['pagar {3}']);
    expect(tg.names(1, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
  });
});
