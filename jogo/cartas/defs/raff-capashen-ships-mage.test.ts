import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Raff Capashen, Ship's Mage";

describe(N, () => {
  it('no turno do oponente, conjura artefato e lendária, mas não outra criatura', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Forest', 'Forest', 'Forest'], []], hand: [['Sol Ring', 'Rishkar, Peema Renegade', 'Scavenging Ooze'], []] });
    tg.pass();
    expect(tg.canCast('Sol Ring')).toBe(true);
    expect(tg.canCast('Rishkar, Peema Renegade')).toBe(true);
    expect(tg.canCast('Scavenging Ooze')).toBe(false);
  });

  it('o próprio Raff tem lampejo', () => {
    const tg = setup({ active: 1, battlefield: [['Plains', 'Plains', 'Island', 'Island'], []], hand: [[N], []] });
    tg.pass();
    expect(tg.canCast(N)).toBe(true);
  });
});
