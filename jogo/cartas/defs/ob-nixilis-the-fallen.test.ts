import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Ob Nixilis, the Fallen";

describe(C, () => {
  it('queda de terreno: o alvo perde 3 e ele ganha três marcadores', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest'], []] });
    tg.yes('Ob Nixilis').choose('jogador alvo', ['Bruno']).play('Forest').resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.state.objects[tg.bf(C)].counters['+1/+1']).toBe(3);
  });
});
