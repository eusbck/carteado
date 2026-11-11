import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bruenor Battlehammer';

describe(N, () => {
  it('cada criatura sua recebe +2/+0 para cada Equipamento anexado a ela', () => {
    const tg = setup({ battlefield: [[N, { name: 'Shadowspear', attachTo: 'Indomitable Ancients' }, { name: 'Swiftfoot Boots', attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients', 'Llanowar Elves'], ['Wall of Omens']] });
    // 2/10, +1/+1 do Shadowspear, +4/+0 pelos dois Equipamentos
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([7, 11]);
    expect(tg.pt(tg.bf('Llanowar Elves'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf(N))).toEqual([5, 3]);
  });

  it('a primeira habilidade de equipar do turno custa {0}; a segunda, o custo normal', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Swiftfoot Boots', 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate('Shadowspear', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    // a segunda paga {1}
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate('Swiftfoot Boots', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    // sem mana, a terceira não dá
    expect(tg.actionIds().some((a) => a.startsWith(`act:${tg.bf('Shadowspear')}:`))).toBe(false);
  });

  it('a gratuidade volta no turno seguinte', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Indomitable Ancients', 'Wall of Omens'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate('Shadowspear', 'Equipar').resolveAll();
    expect(tg.actionIds().some((a) => a.startsWith(`act:${tg.bf('Shadowspear')}:`))).toBe(false);
    tg.passTo('main1', 1).passTo('main1', 0);
    tg.choose('criatura alvo que você controla', ['Wall of Omens']).activate('Shadowspear', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Wall of Omens'));
  });
});
