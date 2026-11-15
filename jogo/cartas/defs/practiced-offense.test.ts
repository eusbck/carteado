import { describe, expect, it } from 'vitest';
import { exile, hasKw, manaValue } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Practiced Offense';
const MANA = ['Plains', 'Forest', 'Forest'];

describe(N, () => {
  it('põe um marcador em cada criatura do jogador alvo e dá golpe duplo à criatura alvo', () => {
    const tg = setup({ battlefield: [[...MANA, 'Indomitable Ancients', 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []], library: [['Forest'], ['Forest']] });
    tg.choose('jogador alvo', ['Ana']).choose('criatura alvo', [tg.bf('Indomitable Ancients', 0)]).choose('escolha a habilidade', ['Golpe duplo']).cast(N).resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients', 0))).toEqual([3, 11]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Indomitable Ancients', 1))).toEqual([2, 10]);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients', 0), 'double strike')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients', 0), 'lifelink')).toBe(false);
    tg.passTo('cleanup');
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients', 0), 'double strike')).toBe(false);
    expect(tg.pt(tg.bf('Indomitable Ancients', 0))).toEqual([3, 11]);
  });

  it('pode visar o oponente e dar vínculo com a vida a uma criatura de outro jogador', () => {
    const tg = setup({ battlefield: [[...MANA, 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('jogador alvo', ['Bruno']).choose('criatura alvo', ['Elvish Mystic']).choose('escolha a habilidade', ['Vínculo com a vida']).cast(N).resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'lifelink')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'double strike')).toBe(false);
  });

  it('CR 608.2b: ainda põe marcadores se só a criatura alvo ficar ilegal', () => {
    const tg = setup({ battlefield: [[...MANA, 'Indomitable Ancients'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('jogador alvo', ['Ana']).choose('criatura alvo', ['Elvish Mystic']).cast(N);
    tg.run(exile(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('CR 702.34a: conjura diretamente do cemitério por duas manas e exila ao resolver', () => {
    const tg = setup({ battlefield: [['Plains', 'Forest', 'Indomitable Ancients'], []], graveyard: [[N], []] });
    tg.choose('jogador alvo', ['Ana']).choose('criatura alvo', ['Indomitable Ancients']).choose('escolha a habilidade', ['Golpe duplo']).cast(N, 'flashback');
    expect(manaValue(tg.g, tg.find(N, 'stack')!)).toBe(3);
    tg.resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });

  it('a retrospectiva exila a carta mesmo se a mágica for anulada', () => {
    const tg = setup({ battlefield: [['Plains', 'Forest', 'Indomitable Ancients'], ['Island', 'Island']], graveyard: [[N], []], hand: [[], ['Counterspell']] });
    tg.choose('jogador alvo', ['Ana']).choose('criatura alvo', ['Indomitable Ancients']).cast(N, 'flashback').pass();
    tg.choose('mágica alvo', [N]).cast('Counterspell').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });

  it('a retrospectiva segue o tempo de feitiço', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Plains', 'Forest', 'Indomitable Ancients'], []], graveyard: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
