import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Tenured Tethermage";

describe(C, () => {
  it('sacrifica terreno e cria duas Heartwood viradas', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Mountain', 'Forest'], []], hand: [[C], []] });
    tg.lenient = true;
    tg.yes('Tenured').choose('Sacrifique um terreno', ['Forest']).cast(C).resolve().resolveAll();
    expect(tg.all('Heartwood').length).toBe(2);
  });
});
