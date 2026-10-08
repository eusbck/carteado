import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const WST = "White Sun's Twilight";
const planicies = (n: number) => Array(n).fill('Plains');

describe(WST, () => {
  it('X = 3: você ganha 3 de vida e cria três Phyrexian Mites; nada é destruído', () => {
    const tg = setup({ battlefield: [[...planicies(5), 'Wall of Omens'], ['Indomitable Ancients']], hand: [[WST], []] });
    tg.number('valor de X', 3).cast(WST).resolve();
    expect(tg.life(0)).toBe(43);
    const mites = tg.all('Phyrexian Mite');
    expect(mites.length).toBe(3);
    for (const id of mites) expect(hasKw(tg.g, id, 'toxic')).toBe(true);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([WST]);
  });

  it('X = 5: destrói todas as outras criaturas, as suas também, mas não as fichas criadas', () => {
    const tg = setup({
      battlefield: [[...planicies(7), 'Wall of Omens', { name: 'Phyrexian Mite', token: true }], ['Indomitable Ancients', 'Zetalpa, Primal Dawn']],
      hand: [[WST], []],
    });
    const antiga = tg.bf('Phyrexian Mite');
    tg.number('valor de X', 5).cast(WST).resolve();
    expect(tg.life(0)).toBe(45);
    const mites = tg.all('Phyrexian Mite');
    expect(mites.length).toBe(5);
    expect(mites).not.toContain(antiga);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Wall of Omens', WST]);
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    // indestrutível não é destruído (CR 702.12b)
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
  });

  it('as fichas causam o dano normal e o jogador também recebe veneno', () => {
    const tg = setup({ battlefield: [planicies(4), []], hand: [[WST], []], library: [['Plains'], ['Island']] });
    tg.number('valor de X', 2).cast(WST).resolve();
    tg.passTo('main1', 1).passTo('main1', 0);
    const [a, b] = tg.all('Phyrexian Mite');
    tg.attack([[a, 1], [b, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(38);
    expect(tg.state.players[1].counters.poison).toBe(2);
  });
});
