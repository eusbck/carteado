import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Springleaf Parade';

describe(N, () => {
  it('com X = 2, cria dois Metamorfos', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.number('X', 2).cast(N).resolve();
    tg.resolveAll();
    expect(tg.all('Shapeshifter').length).toBe(2);
  });
  it('as fichas de criatura que você controla geram mana de qualquer cor; as que não são fichas não', () => {
    const tg = setup({ battlefield: [[N, { name: 'Elf Warrior', token: true }, 'Indomitable Ancients'], []] });
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf('Indomitable Ancients'))).toBe(false);
    const cores = new Set(manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf('Elf Warrior')).flatMap((o) => o.alt));
    expect([...cores].sort()).toEqual(['B', 'G', 'R', 'U', 'W']);
  });
});
