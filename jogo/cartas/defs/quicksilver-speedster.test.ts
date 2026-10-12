import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Quicksilver, Speedster';

describe(N, () => {
  it('lampejo, golpe duplo e ímpeto; virado, você conjura mágicas como se tivessem lampejo', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Silver Myr'], []] });
    for (const kw of ['flash', 'double strike', 'haste']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    tg.pass();
    expect(tg.canCast('Silver Myr')).toBe(false);
    tg.state.objects[tg.bf(N)].tapped = true;
    tg.refresh();
    expect(tg.canCast('Silver Myr')).toBe(true);
  });
});