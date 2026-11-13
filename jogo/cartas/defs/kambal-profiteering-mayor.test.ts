import { describe, expect, it } from 'vitest';
import { createTokens, putOntoBattlefield } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Kambal, Profiteering Mayor';

describe(N, () => {
  it('copia as fichas do oponente viradas, sem os marcadores; só uma vez por turno', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, putOntoBattlefield(tg.g, [
      { controller: 1, token: { def: 'Treasure' } },
      { controller: 1, token: { def: 'Servo' }, counters: { '+1/+1': 2 } },
    ], 'token'));
    tg.resolveAll();
    const meus = tg.names(0, 'battlefield');
    expect(meus.filter((n) => n === 'Treasure')).toHaveLength(1);
    expect(meus.filter((n) => n === 'Servo')).toHaveLength(1);
    const servo = tg.all('Servo').find((id) => tg.state.objects[id].controller === 0)!;
    expect(tg.state.objects[servo].tapped).toBe(true);
    expect(tg.pt(servo)).toEqual([1, 1]);
    // as minhas fichas entrando drenam 1 (uma vez pelo lote)
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
    // segunda vez no turno: não copia de novo
    runEffect(tg, createTokens(tg.g, 1, 'Food', 1));
    tg.resolveAll();
    expect(tg.names(0, 'battlefield')).not.toContain('Food');
  });

  it('fichas suas entrando: cada oponente perde 1 e você ganha 1', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 3));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([41, 39, 39]);
  });
});
