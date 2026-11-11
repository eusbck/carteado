import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Type-03 Borg Vessel';

describe(C, () => {
  it('com 7+ cargas, cria um Borg ao conjurar uma mágica', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { charge: 7 } }, 'Island'], []], hand: [['Opt'], []], library: [['Opt', 'Opt'], []] });
    tg.cast('Opt').resolveAll();
    expect(tg.all('Borg').length).toBe(1);
  });
  it('sem cargas, não', () => {
    const tg = setup({ battlefield: [[C, 'Island'], []], hand: [['Opt'], []], library: [['Opt', 'Opt'], []] });
    tg.cast('Opt').resolveAll();
    expect(tg.all('Borg').length).toBe(0);
  });
});
