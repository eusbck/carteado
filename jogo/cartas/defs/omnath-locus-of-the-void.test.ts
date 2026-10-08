import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addMana } from '../../motor/api.ts';

const OMNATH = 'Omnath, Locus of the Void';
const reserva = (tg: ReturnType<typeof setup>, p = 0) => tg.state.players[p].manaPool.map((u) => u.type);

describe(OMNATH, () => {
  it('Queda de terreno: adiciona {C}{C}; Omnath recebe +1/+1 por mana não gasta', () => {
    const tg = setup({ battlefield: [[OMNATH], []], hand: [['Forest'], []] });
    expect(tg.pt(tg.bf(OMNATH))).toEqual([6, 6]);
    tg.play('Forest').resolve();
    expect(reserva(tg)).toEqual(['C', 'C']);
    expect(tg.pt(tg.bf(OMNATH))).toEqual([8, 8]);
  });

  it('a mana fica, incolor, de uma etapa para outra e de um turno para outro; sem Omnath, se perde no fim da etapa', () => {
    const tg = setup({
      battlefield: [[OMNATH, 'Plains'], []], hand: [['Forest', 'Swords to Plowshares'], []],
      library: [['Plains', 'Plains'], ['Island', 'Island']],
    });
    tg.play('Forest').resolve();
    addMana(tg.g, 0, ['G']);
    tg.refresh();
    expect(tg.pt(tg.bf(OMNATH))).toEqual([9, 9]);
    tg.passTo('beginCombat');
    expect(reserva(tg)).toEqual(['C', 'C', 'C']);
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(reserva(tg)).toEqual(['C', 'C', 'C']);
    expect(tg.pt(tg.bf(OMNATH))).toEqual([9, 9]);
    // Omnath sai: a mana ainda fica até o fim desta fase
    tg.choose('criatura alvo', [OMNATH]).cast('Swords to Plowshares').resolve();
    expect(tg.find(OMNATH)).toBeNull();
    expect(reserva(tg)).toEqual(['C', 'C', 'C']);
    tg.passTo('beginCombat');
    expect(reserva(tg)).toEqual([]);
  });

  it('a mana que vira incolor mantém a restrição de uso', () => {
    // Abstract Paintmage: {U}{R} só para instantâneas e feitiços
    const tg = setup({ step: 'upkeep', battlefield: [[OMNATH, 'Abstract Paintmage'], []], hand: [['Sol Ring'], []], library: [['Plains'], []] });
    tg.passTo('main1');
    expect(reserva(tg)).toEqual(['U', 'R']);
    tg.passTo('main2');
    const pool = tg.state.players[0].manaPool;
    expect(pool.map((u) => [u.type, u.restriction])).toEqual([['C', 'Abstract Paintmage:instantaneasFeiticos'], ['C', 'Abstract Paintmage:instantaneasFeiticos']]);
    // continua sem poder pagar um artefato
    expect(tg.canCast('Sol Ring')).toBe(false);
  });
});
