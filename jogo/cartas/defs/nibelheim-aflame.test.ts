import { describe, expect, it } from 'vitest';
import { addEffect } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Nibelheim Aflame';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(N, () => {
  it('a criatura alvo causa dano igual à força a cada outra criatura; da mão, não descarta', () => {
    const tg = setup({ battlefield: [[...montanhas(4), 'Jumbo Cactuar', 'Silver Myr'], ['Wall of Omens', 'Llanowar Elves']], hand: [[N, 'Island'], []] });
    tg.choose('criatura alvo que você controla', ['Silver Myr']).cast(N).resolveAll();
    // Silver Myr (1/1) causa 1 a cada outra criatura: o elfo morre; Jumbo Cactuar (1/7) e a muralha (0/4) ficam
    expect(tg.find('Llanowar Elves')).toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('com retrospectiva, do cemitério: descarta a mão e compra quatro; depois é exilada', () => {
    const tg = setup({ battlefield: [[...montanhas(7), 'Silver Myr'], []], hand: [['Island', 'Swamp'], []], graveyard: [[N], []] });
    tg.choose('criatura alvo que você controla', ['Silver Myr']).cast(N, 'flashback').resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Swamp']);
    expect(tg.names(0, 'hand').length).toBe(4);
    expect(tg.find(N, 'exile')).not.toBeNull();
  });

  it('com o alvo ilegal, não resolve e não descarta nem compra', () => {
    const tg = setup({ battlefield: [[...montanhas(7), 'Silver Myr'], ['Mountain']], hand: [['Island'], ['Lightning Bolt']], graveyard: [[N], []] });
    tg.choose('criatura alvo que você controla', ['Silver Myr']).cast(N, 'flashback');
    tg.pass();
    tg.choose('alvo', ['Silver Myr']).cast('Lightning Bolt');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('a fonte do dano é a criatura (proteção contra vermelho não impede o dano de uma criatura branca)', () => {
    const tg = setup({ battlefield: [[...montanhas(4), 'Serra Angel'], [{ name: 'Llanowar Elves' }]], hand: [[N], []] });
    addEffect(tg.g, { source: -1, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [tg.bf('Llanowar Elves')], mods: [{ k: 'addKeyword', kw: 'protection', param: 'color:R' }] });
    tg.refresh();
    tg.choose('criatura alvo que você controla', ['Serra Angel']).cast(N).resolveAll();
    expect(tg.find('Llanowar Elves')).toBeNull();
  });
});
