import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Dimir Infiltrator';

describe(N, () => {
  it('não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
  });
  it('CR 702.53a: transmutar procura uma carta com valor de mana 2', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp', 'Island'], []], hand: [[N], []], library: [['Counterspell', 'Opt', 'Mind Stone'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Transmutar: procure')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Mind Stone')!.id] };
    });
    tg.activate(N, 'Transmutar').resolve();
    expect(servem).toEqual(['Counterspell', 'Mind Stone']);
    expect(tg.names(0, 'hand')).toEqual(['Mind Stone']);
  });
});
