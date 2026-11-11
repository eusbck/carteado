import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Akiri, Fearless Voyager';

describe(N, () => {
  it('atacar dois jogadores com criaturas equipadas compra duas cartas; a sem equipamento não conta', () => {
    const tg = setup({
      players: 3,
      battlefield: [[N, 'Silver Myr', 'Llanowar Elves', 'Jumbo Cactuar', { name: 'Lightning Greaves', attachTo: 'Silver Myr' }, { name: 'Swiftfoot Boots', attachTo: 'Llanowar Elves' }], [], []],
      step: 'beginCombat',
    });
    tg.attack([['Silver Myr', 1], ['Llanowar Elves', 2], ['Jumbo Cactuar', 2]]);
    tg.passTo('declareBlockers');
    expect(tg.names(0, 'hand').length).toBe(2);
  });

  it('{W}: desanexa, vira a criatura e ela ganha indestrutível; o Equipamento fica no campo', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Silver Myr', { name: 'Loxodon Warhammer', attachTo: 'Silver Myr' }], []] });
    tg.choose('desanexar um Equipamento', ['Loxodon Warhammer (em Silver Myr)']).activate(N, '{W}').resolveAll();
    const myr = tg.bf('Silver Myr');
    expect(tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo).toBeNull();
    expect(tg.state.objects[myr].tapped).toBe(true);
    expect(hasKw(tg.g, myr, 'indestructible')).toBe(true);
  });
});
