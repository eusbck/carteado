import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Vincent Valentine // Galian Beast";

describe(C, () => {
  it('ganha marcadores iguais à força da criatura do oponente que morre', () => {
    const tg = setup({ battlefield: [[C, 'Swamp', 'Memnite'], [{ name: 'Elvish Mystic', counters: { '+1/+1': 2 } }]], hand: [['Innocent Blood'], []] });
    tg.choose('Sacrifique', ['Memnite']).cast('Innocent Blood').resolve().resolveAll();
    expect(tg.state.objects[tg.bf(C)].counters['+1/+1']).toBe(3);
  });
});
