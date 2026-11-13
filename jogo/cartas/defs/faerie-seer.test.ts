import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Faerie Seer';

describe(N, () => {
  it('CR 701.22a: ao entrar, vidência 2', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[N], []], library: [['Plains', 'Swamp', 'Forest'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Plains', 'Swamp']);
  });
});
