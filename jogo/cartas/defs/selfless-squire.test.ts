import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage, ruleEffect } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';

const NOME = 'Selfless Squire';

describe(NOME, () => {
  it('com lampejo no combate do oponente: previne o dano a você e recebe um marcador por ponto de dano prevenido', () => {
    const tg = setup({ active: 1, battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.attack([['Indomitable Ancients', 0]]);
    tg.passUntil((x) => x.pending?.player === 0 && x.state.turn.step === 'declareAttackers');
    tg.cast(NOME).resolveAll();
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
    const sq = tg.bf(NOME);
    expect(tg.state.objects[sq].counters['+1/+1']).toBe(2);
    expect(tg.pt(sq)).toEqual([3, 3]);
  });

  it('dano prevenido por outro efeito também conta', () => {
    const tg = setup({ battlefield: [[NOME], ['Indomitable Ancients']] });
    // um escudo que não é do Squire
    ruleEffect({ g: tg.g, you: 0, source: tg.bf('Indomitable Ancients') } as unknown as Ctx, 'Selfless Squire:previne', { kind: 'endOfTurn' });
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    tg.refresh().resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.state.objects[tg.bf(NOME)].counters['+1/+1']).toBe(3);
  });
});
