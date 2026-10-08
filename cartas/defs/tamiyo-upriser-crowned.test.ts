import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const TAMIYO = 'Tamiyo, Upriser Crowned';
const terrenos = ['Mountain', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'];
const grimorio = (n: number) => Array(n).fill('Plains');

describe(TAMIYO, () => {
  it('voar, golpe duplo e ímpeto; quando entra, você se torna o monarca', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[TAMIYO], []] });
    tg.cast(TAMIYO).resolveAll();
    const t = tg.bf(TAMIYO);
    for (const k of ['flying', 'double strike', 'haste']) expect(hasKw(tg.g, t, k), k).toBe(true);
    expect(tg.state.monarch).toBe(0);
  });

  it('dano de combate de Bruno: as criaturas são viradas e atordoadas, e Bruno passa a ser o monarca', () => {
    const tg = setup({
      battlefield: [terrenos, ['Indomitable Ancients', 'Goldspan Dragon']],
      hand: [[TAMIYO], []], library: [grimorio(3), grimorio(3)],
    });
    tg.cast(TAMIYO).resolveAll().passTo('main1', 1);
    tg.attack([['Indomitable Ancients', 0], ['Goldspan Dragon', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(34);
    const anc = tg.bf('Indomitable Ancients');
    const dragao = tg.bf('Goldspan Dragon');
    for (const id of [anc, dragao]) {
      expect(tg.state.objects[id].tapped).toBe(true);
      expect(tg.state.objects[id].counters.stun).toBe(1);
    }
    expect(tg.state.monarch).toBe(1);
    // CR 122.1d: na etapa de desvirar seguinte, em vez de desvirar, sai um marcador de atordoamento
    tg.passTo('upkeep', 1);
    for (const id of [anc, dragao]) {
      expect(tg.state.objects[id].tapped).toBe(true);
      expect(tg.state.objects[id].counters.stun ?? 0).toBe(0);
    }
  });

  it('sem ser o monarca, nada acontece', () => {
    const tg = setup({ active: 1, battlefield: [[TAMIYO], ['Indomitable Ancients']], library: [[], grimorio(1)] });
    tg.attack([['Indomitable Ancients', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(38);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters.stun ?? 0).toBe(0);
  });

  it('golpe duplo do atacante: o primeiro dano tira o monarca, e o segundo não dispara mais', () => {
    // Zetalpa tem golpe duplo e vigilância: atacando, continua desvirada até o gatilho virá-la
    const tg = setup({ active: 1, battlefield: [[TAMIYO], ['Zetalpa, Primal Dawn', 'Indomitable Ancients']], library: [[], grimorio(1)] });
    tg.state.monarch = 0;
    tg.g.bump();
    tg.refresh();
    tg.attack([['Zetalpa, Primal Dawn', 0], ['Indomitable Ancients', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(30);
    const z = tg.bf('Zetalpa, Primal Dawn');
    expect(tg.state.objects[z].tapped).toBe(true);
    expect(tg.state.objects[z].counters.stun).toBe(1);
    // os 2 dos Ancients vieram na etapa normal, quando Bruno já era o monarca
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters.stun ?? 0).toBe(0);
    expect(tg.state.monarch).toBe(1);
  });
});
