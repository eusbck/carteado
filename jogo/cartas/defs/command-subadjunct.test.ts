import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Command Subadjunct';

describe(N, () => {
  it('as criaturas artefato que você controla têm vigilância e não viram ao atacar', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }, 'Wall of Omens'], [{ name: 'Borg', token: true }]] });
    expect(hasKw(tg.g, tg.bf('Borg', 0), 'vigilance')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Borg', 1), 'vigilance')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'vigilance')).toBe(false);
    tg.attack([[tg.bf('Borg', 0), 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Borg', 0)].tapped).toBe(false);
  });
});
