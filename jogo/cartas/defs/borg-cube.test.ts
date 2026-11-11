import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Borg Cube';

describe(C, () => {
  it('sem carta exilada, exila uma criatura; ao atacar, assimila essa carta', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Plains'), 'Swamp'], ['Wall of Omens']], hand: [[C], []], library: [['Opt'], ['Opt']] });
    tg.choose('até uma criatura', ['Wall of Omens']).cast(C).resolve().resolveAll();
    expect(tg.names(1, 'exile')).toContain('Wall of Omens');
  });
});
