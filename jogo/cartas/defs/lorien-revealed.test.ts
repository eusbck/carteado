import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lórien Revealed';

describe(N, () => {
  it('compra três cartas', () => {
    const tg = setup({ battlefield: [Array(5).fill('Island'), []], hand: [[N], []], library: [['Opt', 'Ponder', 'Forest', 'Swamp'], []] });
    tg.cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Opt', 'Ponder', 'Forest']);
  });
  it('a ciclagem de ilha procura uma carta de Island em vez de comprar', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[N], []], library: [['Opt', 'Forest', 'Coastal Peak', 'Island'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('ilha')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Coastal Peak')!.id] };
    });
    tg.activate(N).resolve();
    expect(servem).toEqual(['Coastal Peak', 'Island']);
    expect(tg.names(0, 'hand')).toEqual(['Coastal Peak']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
