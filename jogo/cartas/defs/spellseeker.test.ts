import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Spellseeker';

describe(N, () => {
  it('ao entrar, busca instantânea ou feitiço com valor de mana 2 ou menos; X no grimório vale 0', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Lightning Bolt', 'Fact or Fiction', 'Sol Ring', 'Earthquake'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana 2 ou menos')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Earthquake')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(servem).toEqual(['Earthquake', 'Lightning Bolt']);
    expect(tg.names(0, 'hand')).toEqual(['Earthquake']);
  });
});
