import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Full Throttle';
const montanhas = Array(6).fill('Mountain');
const A = 'Indomitable Ancients';

describe(N, () => {
  it('na primeira fase principal: dois combates adicionais e, no início de cada combate, desvira quem atacou', () => {
    const tg = setup({ battlefield: [[...montanhas, A], []], hand: [[N], []] });
    tg.cast(N).resolve();
    tg.attack([[A, 1]]).attack([[A, 1]]).attack([[A, 1]]);
    tg.passTo('main2', 0);
    // três combates seguidos, sem fase principal entre eles, e a criatura atacou em todos
    expect(tg.state.turn.combatCount).toBe(3);
    expect(tg.state.turn.mainPhaseCount).toBe(2);
    expect(tg.life(1)).toBe(34);
  });

  it('conjurada na segunda fase principal, vai direto à etapa final depois dos dois combates adicionais', () => {
    const tg = setup({ battlefield: [[...montanhas, A], []], hand: [[N], []] });
    tg.attack([[A, 1]]).passTo('main2', 0);
    expect(tg.state.objects[tg.bf(A)].tapped).toBe(true);
    tg.cast(N).resolve();
    // a criatura que atacou antes de a mágica ser conjurada também desvira
    tg.attack([[A, 1]]).attack([[A, 1]]);
    tg.passTo('end', 0);
    expect(tg.state.turn.combatCount).toBe(3);
    expect(tg.state.turn.mainPhaseCount).toBe(2);
    expect(tg.life(1)).toBe(34);
  });

  it('fora de uma fase principal, só o desvirar vale; não há combates adicionais', () => {
    // Quicksilver virado: conjurar mágicas como se tivessem lampejo
    const tg = setup({ battlefield: [[...montanhas, A, { name: 'Quicksilver, Speedster', tapped: true }], []], hand: [[N], []], step: 'upkeep' });
    tg.cast(N).resolve();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    tg.attack([[A, 1]]).passTo('end', 0);
    expect(tg.state.turn.combatCount).toBe(1);
    expect(tg.life(1)).toBe(38);
  });

  it('o desvirar só vale neste turno', () => {
    const tg = setup({ battlefield: [[...montanhas, A], []], hand: [[N], []] });
    tg.cast(N).resolve();
    tg.attack([[A, 1]]).attack([]).attack([]);
    tg.passTo('main2', 0);
    tg.passTo('upkeep', 1);
    expect(tg.state.delayedTriggers.some((d) => d.abilityId === 'Full Throttle:desvira')).toBe(false);
  });
});
