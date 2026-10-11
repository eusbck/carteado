import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Consider';

describe(N, () => {
  it('vigia 1 e depois compra uma carta', () => {
    // a carta do topo vai para o cemitério e você compra a seguinte
    const tg = setup({ battlefield: [['Island'], []], hand: [[N], []], library: [['Hex', 'Sol Ring', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Hex'].sort());
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });
});
