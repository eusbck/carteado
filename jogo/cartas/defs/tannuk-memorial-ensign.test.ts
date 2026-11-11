import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Tannuk, Memorial Ensign";

describe(C, () => {
  it('na segunda resolução no turno compra', () => {
    const tg = setup({ battlefield: [[C, 'Exploration'], []], hand: [['Forest', 'Island'], []], library: [['Opt'], []] });
    tg.play('Forest').resolveAll();
    tg.play('Island').resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand')).toContain('Opt');
  });
});
