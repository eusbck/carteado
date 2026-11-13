import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Armorcraft Judge', () => {
  it('compra uma carta por criatura com marcador, não por marcador', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Forest', { name: 'Llanowar Elves', counters: { '+1/+1': 3 } }, { name: 'Elvish Mystic', counters: { '+1/+1': 1 } }, 'Arbor Elf'], [{ name: 'Indomitable Ancients', counters: { '+1/+1': 1 } }]],
      hand: [['Armorcraft Judge'], []],
      library: [['Island', 'Island', 'Island'], []],
    });
    tg.cast('Armorcraft Judge').resolve();
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
  });
});
