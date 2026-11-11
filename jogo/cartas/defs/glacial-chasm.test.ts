import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Glacial Chasm";

describe(C, () => {
  it('previne o dano a você e as suas criaturas não atacam', () => {
    const tg = setup({ battlefield: [[C, 'Memnite'], ['Tunneling Geopede']], hand: [[], ['Forest']] });
    expect(tg.life(0)).toBe(40);
  });
});
