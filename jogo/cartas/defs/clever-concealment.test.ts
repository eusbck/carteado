import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Clever Concealment';
const lib = Array(8).fill('Forest');

describe(N, () => {
  it('qualquer número de permanentes não terrenos seus saem de fase e voltam no seu próximo turno', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains'), 'Sol Ring', 'Elvish Mystic', 'Silver Myr'], []], hand: [[N], []], library: [lib, lib] });
    const anel = tg.bf('Sol Ring');
    const elfo = tg.bf('Elvish Mystic');
    tg.choose('Convocar', []).choose('permanentes não terrenos alvo', ['Sol Ring', 'Elvish Mystic']).cast(N).resolveAll();
    expect(tg.state.objects[anel].phasedOut && tg.state.objects[elfo].phasedOut).toBe(true);
    expect(tg.state.objects[tg.bf('Silver Myr')].phasedOut).toBeFalsy();
    tg.passTo('main1', 1);
    expect(tg.state.objects[anel].phasedOut).toBe(true);
    tg.passTo('main1', 0);
    expect(tg.state.objects[anel].phasedOut || tg.state.objects[elfo].phasedOut).toBe(false);
  });

  it('convocar — as criaturas viradas ajudam a pagar', () => {
    // {2}{W}{W} com duas Plains e duas criaturas (o genérico)
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Elvish Mystic', 'Silver Myr'], []], hand: [[N], []], library: [lib, lib] });
    tg.choose('Convocar', ['Elvish Mystic', 'Silver Myr']).choose('permanentes não terrenos alvo', ['Elvish Mystic']).cast(N).resolveAll();
    const elfo = tg.find('Elvish Mystic')!;
    expect(tg.state.objects[elfo].phasedOut).toBe(true);
    expect(tg.state.objects[elfo].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true);
  });
});
