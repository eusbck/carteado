import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Hateful Eidolon', () => {
  it('compra uma carta por Aura sua anexada à criatura que morreu', () => {
    const tg = setup({
      battlefield: [['Hateful Eidolon', { name: 'Ethereal Armor', attachTo: 'Wall of Omens' }, { name: 'Angelic Gift', attachTo: 'Wall of Omens' }], ['Wall of Omens']],
      library: [['Island', 'Island', 'Island'], []],
    });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
  });
  it('Aura destruída junto com a criatura conta; morrendo junto com a criatura encantada, ainda dispara', () => {
    const tg = setup({
      battlefield: [['Hateful Eidolon', 'Wall of Omens', { name: 'Ethereal Armor', attachTo: 'Wall of Omens' }], []],
      library: [['Island', 'Island', 'Island'], []],
    });
    tg.run(destroy(tg.g, [tg.bf('Hateful Eidolon'), tg.bf('Wall of Omens'), tg.bf('Ethereal Armor')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(1);
  });
});
