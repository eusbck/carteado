import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Dwynen's Elite";

describe(N, () => {
  it('com outro Elfo cria a ficha; sem, não dispara', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Llanowar Elves'], []], hand: [[N], []] });
    tg.cast(N).resolve();
    tg.resolveAll();
    expect(tg.find('Elf Warrior')).not.toBeNull();
    const nao = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []] });
    nao.cast(N).resolve();
    expect(nao.state.zones.stack.length).toBe(0);
    expect(nao.find('Elf Warrior')).toBeNull();
  });
});
