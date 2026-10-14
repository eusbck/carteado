import { describe, expect, it } from 'vitest';
import { untilEndOfTurn } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Ram Through';
const alvos = (tg: ReturnType<typeof setup>, minha: string, outra: string) =>
  tg.choose('criatura alvo que você controla', [minha]).choose('criatura alvo que você não controla', [outra]);

describe(N, () => {
  it('sem atropelar, causa dano igual à força só à criatura', () => {
    const tg = setup({ battlefield: [['Ripjaw Raptor', 'Forest', 'Forest'], ['Elvish Mystic']], hand: [[N], []] });
    alvos(tg, 'Ripjaw Raptor', 'Elvish Mystic').cast(N).resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.life(1)).toBe(40);
  });

  it('com atropelar, o excedente além do letal vai para o controlador da outra criatura', () => {
    const tg = setup({ battlefield: [['Gigantosaurus', 'Forest', 'Forest'], [{ name: 'Indomitable Ancients', damage: 3 }]], hand: [[N], []] });
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf('Gigantosaurus') }, [tg.bf('Gigantosaurus')], [{ k: 'addKeyword', kw: 'trample' }]);
    tg.refresh();
    alvos(tg, 'Gigantosaurus', 'Indomitable Ancients').cast(N).resolve();
    // letal: 10 - 3 = 7; excedente 3
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(1)).toBe(37);
  });

  it('com atropelar e toque mortífero, 1 basta e o resto vai para o controlador', () => {
    const tg = setup({ battlefield: [['Ripjaw Raptor', 'Forest', 'Forest'], ['Indomitable Ancients']], hand: [[N], []] });
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf('Ripjaw Raptor') }, [tg.bf('Ripjaw Raptor')], [{ k: 'addKeyword', kw: 'trample' }, { k: 'addKeyword', kw: 'deathtouch' }]);
    tg.refresh();
    alvos(tg, 'Ripjaw Raptor', 'Indomitable Ancients').cast(N).resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(1)).toBe(37);
  });
});
