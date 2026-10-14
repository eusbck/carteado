import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Yeva, Nature's Herald";

describe(N, () => {
  it('com Yeva, conjura criatura verde no turno do oponente; sem ela, ou não verde, não', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Llanowar Elves', 'Silver Myr'], []] });
    tg.pass();
    expect(tg.canCast('Llanowar Elves')).toBe(true);
    expect(tg.canCast('Silver Myr')).toBe(false);
    const sem = setup({ active: 1, battlefield: [['Forest', 'Forest'], []], hand: [['Llanowar Elves'], []] });
    sem.pass();
    expect(sem.canCast('Llanowar Elves')).toBe(false);
  });

  it('a própria Yeva tem lampejo', () => {
    const tg = setup({ active: 1, battlefield: [[...Array(4).fill('Forest')], []], hand: [[N], []] });
    tg.pass();
    expect(tg.canCast(N)).toBe(true);
  });
});
