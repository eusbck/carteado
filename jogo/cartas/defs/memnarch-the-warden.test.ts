import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, hasKw, isType } from '../../motor/api.ts';

describe('Memnarch, the Warden', () => {
  it('ao entrar, cria duas fichas de Myr 1/1 incolores, artefato e criatura', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Sol Ring')], []], hand: [['Memnarch, the Warden'], []] });
    tg.cast('Memnarch, the Warden').resolve().resolveAll();
    const myrs = tg.all('Myr');
    expect(myrs.length).toBe(2);
    for (const id of myrs) {
      expect(tg.pt(id)).toEqual([1, 1]);
      expect(isType(tg.g, id, 'Artifact') && isType(tg.g, id, 'Creature')).toBe(true);
      expect(tg.state.objects[id].isToken).toBe(true);
    }
  });

  it('indestrutível (CR 702.12b)', () => {
    const tg = setup({ battlefield: [['Memnarch, the Warden'], []] });
    expect(hasKw(tg.g, tg.bf('Memnarch, the Warden'), 'indestructible')).toBe(true);
    tg.run(destroy(tg.g, [tg.bf('Memnarch, the Warden')]));
    expect(tg.find('Memnarch, the Warden')).not.toBeNull();
  });

  it('ao atacar, compra uma carta para cada artefato que você controla (contando o próprio Memnarch)', () => {
    const tg = setup({
      battlefield: [['Memnarch, the Warden', 'Sol Ring', { name: 'Myr', token: true }, 'Plains'], ['Mind Stone']],
      library: [['Island', 'Island', 'Island', 'Island', 'Island'], ['Island']],
    });
    tg.attack([['Memnarch, the Warden', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(0, 'hand').length).toBe(3); // Memnarch, Sol Ring e Myr; o Mind Stone do oponente não conta
  });
});
