import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mystical Tutor';

describe(N, () => {
  it('busca uma instantânea ou feitiço, embaralha e põe a carta no topo do grimório', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[N], []], library: [['Forest', 'Lightning Bolt', 'Sol Ring', 'Ponder', 'Swamp'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('instantânea ou de feitiço')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Ponder')!.id] };
    });
    tg.cast(N).resolve();
    expect(servem).toEqual(['Lightning Bolt', 'Ponder']);
    expect(tg.names(0, 'library')[0]).toBe('Ponder');
    expect(tg.names(0, 'library')).toHaveLength(5);
  });
});
