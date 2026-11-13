import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Merchant Scroll';

describe(N, () => {
  it('só serve instantânea azul, e você pode não achar nenhuma', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Lightning Bolt', 'Counterspell', 'Ponder', 'Forest'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('instantânea azul')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Counterspell')!.id] };
    });
    tg.cast(N).resolve();
    expect(servem).toEqual(['Counterspell']);
    expect(tg.names(0, 'hand')).toEqual(['Counterspell']);
    const tg2 = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Counterspell'], []] });
    tg2.choose('instantânea azul', []).cast(N).resolve();
    expect(tg2.names(0, 'hand')).toEqual([]);
  });
});
