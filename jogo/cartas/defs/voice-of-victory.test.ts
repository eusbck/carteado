import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Voice of Victory';

describe(N, () => {
  it('mobilizar 2: atacando cria dois Warriors 1/1 virados e atacando', () => {
    const tg = setup({ battlefield: [[N], []] });
    const vida = tg.life(1);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida - 3);
    tg.passTo('upkeep', 1);
    expect(tg.all('Warrior')).toHaveLength(0);
  });

  it('os oponentes não conjuram mágicas durante o seu turno', () => {
    const com = setup({ battlefield: [[N, 'Forest', 'Forest'], ['Island', 'Island']], hand: [['Silver Myr'], ['Mana Drain']] });
    com.cast('Silver Myr').pass();
    expect(com.canCast('Mana Drain')).toBe(false);
    const sem = setup({ battlefield: [['Forest', 'Forest'], ['Island', 'Island']], hand: [['Silver Myr'], ['Mana Drain']] });
    sem.cast('Silver Myr').pass();
    expect(sem.canCast('Mana Drain')).toBe(true);
  });
});