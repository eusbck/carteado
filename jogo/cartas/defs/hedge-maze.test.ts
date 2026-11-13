import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Hedge Maze";

describe(C, () => {
  it('entra virada e vigia 1', () => {
    const tg = setup({ hand: [[C], []], library: [['Opt'], []] });
    tg.lenient = true;
    tg.play(C).resolveAll();
    expect(tg.state.objects[tg.bf(C)].tapped).toBe(true);
  });
});
