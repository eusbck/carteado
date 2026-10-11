import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Rhys the Redeemed';

describe(N, () => {
  it('{2}{G/W}, {T}: cria um Elf Warrior 1/1 verde e branco', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Plains'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    tg.activate(N, 'Elf Warrior').resolveAll();
    const ficha = tg.bf('Elf Warrior');
    expect(tg.pt(ficha)).toEqual([1, 1]);
    expect([...chars(tg.g, ficha).colors].sort()).toEqual(['G', 'W']);
  });

  it('{4}{G/W}{G/W}, {T}: cria uma cópia de cada ficha de criatura que você controla', () => {
    const tg = setup({ battlefield: [[N, ...Array(6).fill('Forest'), { name: 'Horse', token: true }, { name: 'Pegasus 1/1', token: true }, 'Silver Myr', { name: 'Treasure', token: true }], []] });
    tg.activate(N, 'Para cada ficha').resolveAll();
    expect(tg.all('Horse')).toHaveLength(2);
    expect(tg.all('Pegasus')).toHaveLength(2);
    expect(tg.all('Silver Myr')).toHaveLength(1);
    expect(tg.all('Treasure')).toHaveLength(1);
  });
});