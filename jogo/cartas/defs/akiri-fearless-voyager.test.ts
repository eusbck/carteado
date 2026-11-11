import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Akiri, Fearless Voyager';

describe(N, () => {
  it('uma compra por jogador atacado com criatura equipada, não importa quantas nem quantos Equipamentos', () => {
    const tg = setup({
      players: 3,
      battlefield: [[N, { name: 'Shadowspear', attachTo: 'Indomitable Ancients' }, { name: 'Swiftfoot Boots', attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients',
        { name: 'Lightning Greaves', attachTo: 'Serra Angel' }, 'Serra Angel', 'Llanowar Elves'], [], []],
    });
    const mao = tg.names(0, 'hand').length;
    // dois equipados no jogador 1, um sem equipamento no jogador 2: só uma compra
    tg.attack([['Indomitable Ancients', 1], ['Serra Angel', 1], ['Llanowar Elves', 2]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
  });

  it('atacando dois jogadores com criaturas equipadas, compra duas', () => {
    const tg = setup({
      players: 3,
      battlefield: [[N, { name: 'Shadowspear', attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients', { name: 'Lightning Greaves', attachTo: 'Serra Angel' }, 'Serra Angel'], [], []],
    });
    const mao = tg.names(0, 'hand').length;
    tg.attack([['Indomitable Ancients', 1], ['Serra Angel', 2]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao + 2);
  });

  it('atacar um planeswalker com a criatura equipada não compra', () => {
    const tg = setup({ battlefield: [[N, { name: 'Shadowspear', attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients'], ['Garruk, Cursed Huntsman']] });
    const pw = tg.bf('Garruk, Cursed Huntsman');
    const mao = tg.names(0, 'hand').length;
    tg.attack([['Indomitable Ancients', { kind: 'obj', id: pw }]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao);
  });

  it('{W}: desanexa o Equipamento escolhido, que fica no campo; a criatura vira e ganha indestrutível', () => {
    const tg = setup({ battlefield: [[N, { name: 'Shadowspear', attachTo: 'Indomitable Ancients' }, { name: 'Swiftfoot Boots', attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('desanexar', ['Shadowspear (de Indomitable Ancients)']).activate(N, 'desanexar').resolveAll();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
    expect(tg.state.objects[tg.bf('Swiftfoot Boots')].attachedTo).toBe(a);
    expect(tg.state.objects[a].tapped).toBe(true);
    expect(hasKw(tg.g, a, 'indestructible')).toBe(true);
  });

  it('se não desanexar nada, a criatura não vira', () => {
    const tg = setup({ battlefield: [[N, { name: 'Shadowspear', attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('desanexar', []).activate(N, 'desanexar').resolveAll();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(a);
    expect(tg.state.objects[a].tapped).toBe(false);
    expect(hasKw(tg.g, a, 'indestructible')).toBe(false);
  });

  it('com a criatura já virada, só ganha indestrutível', () => {
    const tg = setup({ battlefield: [[N, { name: 'Shadowspear', attachTo: 'Indomitable Ancients' }, { name: 'Indomitable Ancients', tapped: true }, 'Plains'], []] });
    tg.choose('desanexar', ['Shadowspear (de Indomitable Ancients)']).activate(N, 'desanexar').resolveAll();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[a].tapped).toBe(true);
    expect(hasKw(tg.g, a, 'indestructible')).toBe(true);
  });
});
