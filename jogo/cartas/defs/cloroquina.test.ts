import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cloroquina';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('destrói a criatura; o controlador dela ganha 3 de vida e você ganha 5', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []], library: [lib, lib] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.life(1)).toBe(43);
    expect(tg.life(0)).toBe(45);
  });

  it('na sua própria criatura, você ganha 8', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp', 'Swamp', 'Elvish Mystic'], []], hand: [[N], []], library: [lib, lib] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N).resolveAll();
    expect(tg.life(0)).toBe(48);
  });
});
