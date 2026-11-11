import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Tiller Engine";

describe(C, () => {
  it('terreno que entra virado pode desvirar', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Rocky Tar Pit'], []] });
    tg.choose('modo', ['Desvire esse terreno.']).play('Rocky Tar Pit').resolveAll();
    expect(tg.state.objects[tg.bf('Rocky Tar Pit')].tapped).toBe(false);
  });
});
