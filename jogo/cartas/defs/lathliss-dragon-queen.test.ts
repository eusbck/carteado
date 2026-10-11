import { describe, expect, it } from 'vitest';
import { createTokens, putOntoBattlefield } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const L = 'Lathliss, Dragon Queen';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(L, () => {
  it('voar; outro Dragon seu que não é ficha entra: cria uma ficha Dragon 5/5 vermelha com voar', () => {
    const tg = setup({ battlefield: [[L, ...montanhas(5)], []], hand: [['Rapacious Dragon'], []] });
    expect(hasKw(tg.g, tg.bf(L), 'flying')).toBe(true);
    tg.cast('Rapacious Dragon').resolveAll();
    const fichas = tg.all('Dragon').filter((id) => tg.state.objects[id].isToken);
    expect(fichas).toHaveLength(1);
    expect(tg.pt(fichas[0])).toEqual([5, 5]);
    expect(hasKw(tg.g, fichas[0], 'flying')).toBe(true);
  });
  it('ficha de Dragon e Dragon de oponente não disparam', () => {
    const tg = setup({ battlefield: [[L], montanhas(5)], hand: [[], ['Rapacious Dragon']], active: 1 });
    tg.run(createTokens(tg.g, 0, 'Dragon 5/5', 1));
    expect(tg.state.pendingTriggers).toHaveLength(0);
    tg.cast('Rapacious Dragon').resolveAll();
    expect(tg.all('Dragon').filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
  });
  it('entrando junto com outros Dragons não ficha, dispara uma vez para cada um', () => {
    const tg = setup({ battlefield: [[], []], hand: [[L, 'Rapacious Dragon', 'Thunderbreak Regent'], []] });
    const ids = [L, 'Rapacious Dragon', 'Thunderbreak Regent'].map((n) => tg.find(n, 'hand')!);
    tg.run(putOntoBattlefield(tg.g, ids.map((id) => ({ id, controller: 0 })), 'effect'));
    tg.resolveAll();
    expect(tg.all('Dragon').filter((id) => tg.state.objects[id].isToken)).toHaveLength(2);
  });
  it('CR 611.2c: {1}{R}: os Dragons que você controla agora recebem +1/+0 até o fim do turno', () => {
    const tg = setup({ battlefield: [[L, 'Thunderbreak Regent', 'Wall of Omens', ...montanhas(2)], ['Rapacious Dragon']], hand: [[], []] });
    tg.activate(L).resolve();
    expect(tg.pt(tg.bf(L))).toEqual([7, 6]);
    expect(tg.pt(tg.bf('Thunderbreak Regent'))).toEqual([5, 4]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
    expect(tg.pt(tg.bf('Rapacious Dragon'))).toEqual([3, 3]);
    // um Dragon que entra depois não é afetado
    tg.run(createTokens(tg.g, 0, 'Dragon 5/5', 1));
    const ficha = tg.all('Dragon').find((id) => tg.state.objects[id].isToken)!;
    expect(tg.pt(ficha)).toEqual([5, 5]);
    tg.passTo('cleanup');
    expect(tg.pt(tg.bf(L))).toEqual([6, 6]);
  });
});
