import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel";

describe(C, () => {
  it('drena quando outra criatura morre; na quarta vez no turno transforma e dá o emblema', () => {
    const tg = setup({ battlefield: [[C, 'Swamp', ...Array(4).fill({ name: 'Thrull', token: true })], []], hand: [['Innocent Blood', 'Innocent Blood', 'Innocent Blood', 'Innocent Blood'], []], library: [['Opt'], ['Opt']] });
    tg.lenient = true;
    for (let i = 0; i < 4; i++) {
      tg.state.players[0].manaPool.push({ type: 'B', source: null });
      tg.choose('Sacrifique', ['Thrull']).cast('Innocent Blood').resolveAll();
    }
    expect(tg.life(1)).toBe(36);
    expect(tg.state.objects[tg.bf(C)].face).toBe(1);
    expect(hasKw(tg.g, tg.bf(C), 'flying')).toBe(true);
  });
});
