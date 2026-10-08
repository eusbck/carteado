import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Jaddi Offshoot', () => {
  it('dispara jogando terreno ou colocando-o no campo por efeito', () => {
    const tg = setup({ battlefield: [['Jaddi Offshoot', { name: 'Sakura-Tribe Elder' }], []], hand: [['Forest'], []], library: [['Plains'], []] });
    tg.play('Forest').resolve();
    expect(tg.life(0)).toBe(41);
    tg.choose('terreno básico', ['Plains']).activate('Sakura-Tribe Elder').resolve().resolve();
    expect(tg.life(0)).toBe(42);
  });
});
