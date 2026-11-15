import { describe, expect, it } from 'vitest';
import { addCounters, addEffect, destroy, hasKw } from '../../motor/api.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Misty Mountains Cold';
const tesouros = (n: number) => Array.from({ length: n }, () => ({ name: 'Treasure', token: true }));

describe(N, () => {
  it('CR 714.3: cria um Tesouro em cada capítulo e no IV sacrifica a Saga para criar o Dragão 6/6', () => {
    const tg = setup();
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.all('Treasure')).toHaveLength(1);
    for (let capitulo = 2; capitulo <= 4; capitulo++) {
      tg.passTo('main1', 1).passTo('main1', 0).resolveAll();
      expect(tg.all('Treasure')).toHaveLength(capitulo);
    }
    expect(tg.find(N)).toBeNull();
    expect(tg.all('Dragon 6/6')).toHaveLength(1);
    expect(tg.pt(tg.bf('Dragon 6/6'))).toEqual([6, 6]);
    expect(hasKw(tg.g, tg.bf('Dragon 6/6'), 'flying')).toBe(true);
  });
  it('pode criar o Dragão já no primeiro capítulo se os Tesouros anteriores completarem quatro', () => {
    const tg = setup({ battlefield: [tesouros(3), []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.all('Dragon 6/6')).toHaveLength(1);
    expect(tg.all('Treasure')).toHaveLength(4);
  });
  it('CR 714.4: sem quatro Tesouros, o sacrifício baseado no estado depois do IV não cria Dragão', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { lore: 3 } }], []], active: 1 });
    tg.passTo('main1', 0).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.all('Treasure')).toHaveLength(1);
    expect(tg.all('Dragon 6/6')).toHaveLength(0);
  });
  it('o capítulo ainda cria Tesouro se a Saga sair, mas não cria Dragão sem sacrificá-la', () => {
    const tg = setup({ battlefield: [tesouros(3), []] });
    enterCard(tg, N, 0);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.all('Treasure')).toHaveLength(4);
    expect(tg.all('Dragon 6/6')).toHaveLength(0);
  });
  it('não cria Dragão quando uma regra proíbe sacrificar a Saga', () => {
    const tg = setup({ battlefield: [tesouros(3), []] });
    enterCard(tg, N, 0);
    const saga = tg.bf(N);
    addEffect(tg.g, { source: saga, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [saga], mods: [{ k: 'rule', id: 'rule:cantBeSacrificed' }] });
    tg.resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.all('Dragon 6/6')).toHaveLength(0);
  });
  it('CR 714.2c: vários capítulos atingidos juntos disparam individualmente', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { lore: 1 } }], []] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf(N) }, 'lore', 2, 0);
    tg.refresh().resolveAll();
    expect(tg.all('Treasure')).toHaveLength(2);
  });
});
