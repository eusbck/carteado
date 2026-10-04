import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Welcoming Vampire', () => {
  it('força conferida ao entrar; uma vez por turno', () => {
    const tg = setup({ battlefield: [['Welcoming Vampire'], []], library: [['Island', 'Island'], []] });
    tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('entrando com marcadores +1/+1, conta a força com eles', () => {
    const tg = setup({ battlefield: [['Welcoming Vampire'], []], library: [['Island'], []] });
    tg.run(createTokens(tg.g, 0, 'Saproling', 1, { counters: { '+1/+1': 2 } }));
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
