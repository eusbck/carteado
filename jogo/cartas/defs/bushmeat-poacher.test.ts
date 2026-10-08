import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Bushmeat Poacher', () => {
  it('ganha vida igual à resistência e compra uma carta só', () => {
    const tg = setup({ battlefield: [['Bushmeat Poacher', 'Wall of Omens', 'Plains'], []], library: [['Island', 'Island'], []] });
    tg.activate('Bushmeat Poacher').resolve();
    expect(tg.life(0)).toBe(44);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('usa a resistência da criatura no campo (com modificadores)', () => {
    // Angelic Gift não muda resistência; Sylvan Caryatid 0/3 com Toxic Deluge X=1 fica 0/2... usamos dano: resistência não muda com dano
    const tg = setup({ battlefield: [['Bushmeat Poacher', { name: 'Indomitable Ancients', damage: 5 }, 'Plains'], []], library: [['Island'], []] });
    tg.activate('Bushmeat Poacher').resolve();
    expect(tg.life(0)).toBe(50);
  });
});
