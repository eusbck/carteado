import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const N = 'Winged Boots';

describe(N, () => {
  it('equipar {1}: a criatura equipada tem voar e resguardo {4}', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Indomitable Ancients'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate(N).resolve();
    const id = tg.bf('Indomitable Ancients');
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'ward')).toBe(true);
  });

  it('resguardo {4}: a mágica do oponente que mira a criatura é anulada se ele não pagar', () => {
    const tg = setup({
      active: 1,
      battlefield: [['Indomitable Ancients', { name: N, attachTo: 'Indomitable Ancients' }], ['Swamp', 'Swamp']],
      hand: [[], ['Infernal Grasp']],
    });
    tg.yes('Pagar {4}', false).choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolveAll();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.find('Infernal Grasp', 'graveyard', 1)).not.toBeNull();
  });
});
