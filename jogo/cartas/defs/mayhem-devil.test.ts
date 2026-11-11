import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Mayhem Devil";

describe(C, () => {
  it('sacrifício de permanente causa 1 de dano', () => {
    const tg = setup({ battlefield: [[C, 'Zuran Orb', 'Forest'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    tg.activate('Zuran Orb').resolveAll();
    expect(tg.life(1)).toBe(39);
  });
});
