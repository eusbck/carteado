import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Earthquake';

describe(N, () => {
  it('X de dano a cada criatura sem voar e a cada jogador', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Serra Angel'], ['Indomitable Ancients', 'Silver Myr']], hand: [[N], []] });
    tg.number('X', 3).cast(N).resolveAll();
    expect(tg.life(0)).toBe(37);
    expect(tg.life(1)).toBe(37);
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(tg.state.objects[tg.bf('Serra Angel')].damage).toBe(0);
  });
});