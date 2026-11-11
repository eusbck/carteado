// Regras acrescentadas para o deck Cloud Nine: força-base (CR 208.1, 613.4), criaturas que atacaram no turno e o fim de
// "enquanto você controlar X" quando X muda de controlador (CR 611.2b).
import { describe, expect, it } from 'vitest';
import { addCounters, basePower, controllerOf, gainControl, power, untilEndOfTurn } from '../motor/api.ts';
import { fixture } from './artefatos.ts';

describe('força-base (CR 208.1, 613.4)', () => {
  it('é a impressa; marcadores e bônus (camada 7c) não mudam a base', () => {
    const tg = fixture({ battlefield: [['Silver Myr'], []] });
    const id = tg.bf('Silver Myr');
    addCounters(tg.g, { kind: 'obj', id }, '+1/+1', 2, 0);
    untilEndOfTurn({ g: tg.g, you: 0, source: id } as never, [id], [{ k: 'pt', p: 1, t: 1 }]);
    tg.refresh();
    expect(power(tg.g, id)).toBe(4);
    expect(basePower(tg.g, id)).toBe(1);
  });

  it('um efeito que define a força (camada 7b) vira a base; a CDA (7a) também conta', () => {
    const tg = fixture({ battlefield: [['Silver Myr', 'Dungrove Elder', 'Forest', 'Forest', 'Forest'], []] });
    const id = tg.bf('Silver Myr');
    untilEndOfTurn({ g: tg.g, you: 0, source: id } as never, [id], [{ k: 'setPT', p: 4, t: 4 }]);
    tg.refresh();
    expect(basePower(tg.g, id)).toBe(4);
    expect(basePower(tg.g, tg.bf('Dungrove Elder'))).toBe(3);
  });
});

describe('criaturas que atacaram neste turno', () => {
  it('turnStats guarda as atacantes de todos os combates do turno e zera no turno seguinte', () => {
    const tg = fixture({ battlefield: [['Silver Myr', 'Indomitable Ancients'], []] });
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.state.turnStats[0].attackersThisTurn).toEqual([tg.bf('Silver Myr')]);
    tg.passTo('upkeep', 1);
    expect(tg.state.turnStats[0].attackersThisTurn ?? []).toEqual([]);
  });
});

describe('CR 611.2b: "enquanto você controlar X"', () => {
  it('acaba quando outro jogador passa a controlar X e não volta quando o controle volta', () => {
    const tg = fixture({ battlefield: [['Silver Myr'], ['Sol Ring', 'Mind Stone']] });
    const myr = tg.bf('Silver Myr');
    gainControl(tg.g, tg.bf('Sol Ring'), 0, { kind: 'whileControlled', obj: myr, player: 0 }, myr);
    tg.refresh().settle();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
    gainControl(tg.g, myr, 1, { kind: 'endOfTurn' }, tg.bf('Mind Stone'));
    tg.refresh().settle();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
    tg.passTo('upkeep', 1);
    expect(controllerOf(tg.g, myr)).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });
});
