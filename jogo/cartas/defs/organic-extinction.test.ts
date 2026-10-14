import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Organic Extinction';

describe(N, () => {
  it('improvisar com artefatos; destrói as criaturas que não são artefato', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Sol Ring', 'Sol Ring', 'Sol Ring', 'Gold Myr', 'Peacewalker Colossus', 'Ripjaw Raptor'], ['Indomitable Ancients', 'Silver Myr']],
      hand: [[N], []],
    });
    // {8}{W}{W}: Plains, Gold Myr e os Sol Ring dão 9; o último {1} vem de virar o Peacewalker Colossus (improvisar)
    tg.cast(N).resolve();
    expect(tg.find('Ripjaw Raptor')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.find('Gold Myr')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Peacewalker Colossus')].tapped).toBe(true);
  });
});
