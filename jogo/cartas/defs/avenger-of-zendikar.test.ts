import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Avenger of Zendikar";

describe(C, () => {
  it('cria uma Plant por terreno', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Forest')], []], hand: [[C], []] });
    tg.cast(C).resolve().resolveAll();
    expect(tg.all('Plant').length).toBe(7);
  });
});
