import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tifa, Martial Artist';
const A = 'Indomitable Ancients';

describe(N, () => {
  it('corpo a corpo conta cada oponente atacado, não quantas criaturas atacaram cada um', () => {
    const tg = setup({ players: 3, battlefield: [[N, A, 'Silver Myr', 'Ornithopter'], [], []] });
    tg.attack([[N, 1], [A, 2], ['Silver Myr', 2], ['Ornithopter', 2]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
  });

  it('força 7 no dano a um jogador: desvira as suas criaturas e há um segundo combate, sem fase principal no meio', () => {
    const tg = setup({ battlefield: [[N, { name: 'Buster Sword', attachTo: N }, A], []] });
    // 4/4 + 3/2 do Equipamento + 1/1 do corpo a corpo = 8/7
    tg.attack([[N, 1], [A, 1]]).attack([[N, 1]]);
    tg.passUntil((x) => x.state.turn.step === 'endCombat' && x.state.turn.combatCount === 1);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
    expect(tg.state.objects[tg.bf(A)].tapped).toBe(false);
    tg.passTo('main2', 0);
    expect(tg.state.turn.combatCount).toBe(2);
    expect(tg.state.turn.mainPhaseCount).toBe(2);
    // 8 + 2 no primeiro combate e 9 no segundo (o corpo a corpo dispara de novo); o segundo não cria um terceiro
    expect(tg.life(1)).toBe(21);
    // no segundo combate o gatilho ainda desvira
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
  });

  it('conta a força de cada criatura, não a soma', () => {
    const tg = setup({ battlefield: [[N, { name: A, counters: { '+1/+1': 3 } }], []] });
    // Tifa 5/5 e Ancients 5/13: somam 10, mas nenhuma tem 7
    tg.attack([[N, 1], [A, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(30);
    expect(tg.state.turn.combatCount).toBe(1);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('outra criatura sua com força 7 também dispara', () => {
    const tg = setup({ battlefield: [[N, { name: A, counters: { '+1/+1': 5 } }], []] });
    tg.attack([[A, 1]]).attack([]).passTo('main2', 0);
    expect(tg.state.turn.combatCount).toBe(2);
    expect(tg.state.objects[tg.bf(A)].tapped).toBe(false);
  });
});
