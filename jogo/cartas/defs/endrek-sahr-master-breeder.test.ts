import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Endrek Sahr, Master Breeder";

describe(C, () => {
  it('cria Thrulls iguais ao valor de mana da mágica de criatura', () => {
    const tg = setup({ battlefield: [[C, 'Swamp', 'Swamp'], []], hand: [['Reassembling Skeleton'], []] });
    tg.cast('Reassembling Skeleton').resolveAll();
    expect(tg.all('Thrull').length).toBe(2);
  });
  it('com sete Thrulls, é sacrificado', () => {
    const tg = setup({ battlefield: [[C, ...Array(7).fill({ name: 'Thrull', token: true })], []] });
    tg.refresh();
    expect(tg.find(C)).toBeNull();
  });
});
