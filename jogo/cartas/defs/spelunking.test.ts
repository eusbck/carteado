import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Spelunking";

describe(C, () => {
  it('terrenos entram desvirados', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Rocky Tar Pit'], []] });
    tg.play('Rocky Tar Pit');
    expect(tg.state.objects[tg.bf('Rocky Tar Pit')].tapped).toBe(false);
  });
});
