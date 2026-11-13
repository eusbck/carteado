import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Awaken the Woods";

describe(C, () => {
  it('cria X Forest Dryads', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest')], []], hand: [[C], []] });
    tg.number('X', 2).cast(C).resolve();
    expect(tg.all('Forest Dryad').length).toBe(2);
  });
});
