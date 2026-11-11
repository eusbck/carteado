import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Muddle the Mixture';

describe(N, () => {
  it('anula a mágica instantânea ou de feitiço; não mira mágica de criatura', () => {
    const tg = setup({ active: 1, battlefield: [['Island', 'Island'], ['Island']], hand: [[N], ['Opt']], library: [[], ['Forest', 'Forest']] });
    tg.cast('Opt').pass().cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Opt']);
    const tg2 = setup({ active: 1, battlefield: [['Island', 'Island'], ['Forest']], hand: [[N], ['Elvish Mystic']] });
    tg2.cast('Elvish Mystic').pass();
    expect(tg2.canCast(N)).toBe(false);
  });
  it('CR 702.53a: transmutar procura uma carta com o mesmo valor de mana (2), só como feitiço', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Counterspell', 'Opt', 'Mind Stone', 'Fact or Fiction'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Transmutar: procure')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Mind Stone')!.id] };
    });
    tg.activate(N, 'Transmutar').resolve();
    expect(servem).toEqual(['Counterspell', 'Mind Stone']);
    expect(tg.names(0, 'hand')).toEqual(['Mind Stone']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    const tg2 = setup({ active: 1, battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Counterspell'], []] });
    tg2.pass();
    expect(tg2.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
