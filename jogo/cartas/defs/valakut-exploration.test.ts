import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Valakut Exploration";

describe(C, () => {
  it('exila o topo na queda de terreno e causa dano na etapa final', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest'], []], library: [['Opt', 'Opt'], ['Opt']] });
    tg.play('Forest').resolveAll();
    tg.passTo('end').resolveAll();
    expect(tg.life(1)).toBe(39);
  });
});
