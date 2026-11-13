import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Tatyova, Benthic Druid";

describe(C, () => {
  it('queda de terreno: 1 de vida e uma carta', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest'], []], library: [['Opt'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.life(0)).toBe(41);
    expect(tg.names(0, 'hand')).toContain('Opt');
  });
});
