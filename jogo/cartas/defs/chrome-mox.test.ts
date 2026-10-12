import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Chrome Mox';

describe(N, () => {
  it('gera mana da cor da carta exilada; sem carta exilada, não gera mana', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N, 'Mana Drain', 'Sol Ring', 'Island'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Chrome Mox')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Mana Drain']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Mana Drain']);
    const opcoes = manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf(N));
    expect(opcoes).toHaveLength(1);
    const vazio = setup({ battlefield: [[N], []] });
    expect(manaOptions(vazio.g, 0).filter((o) => o.obj === vazio.bf(N))).toHaveLength(0);
  });
});