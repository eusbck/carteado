import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Yarok, the Desecrated";

describe(C, () => {
  it('gatilhos de entrada disparam duas vezes', () => {
    const tg = setup({ battlefield: [[C, 'Tatyova, Benthic Druid'], []], hand: [['Forest'], []], library: [['Opt', 'Opt'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
  });
});
