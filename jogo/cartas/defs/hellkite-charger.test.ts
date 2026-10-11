import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Hellkite Charger';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(N, () => {
  it('pagando, desvira as atacantes e o combate adicional vem logo depois, sem fase principal', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', ...montanhas(7)], []], library: [[], ['Island']] });
    const passos: string[] = [];
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]);
    tg.yes('Pagar {5}{R}{R}', true);
    // no segundo combate ataca de novo e recusa pagar outra vez
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]);
    tg.yes('Pagar {5}{R}{R}', false);
    tg.passUntil((x) => x.state.turn.step === 'declareBlockers');
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(false);
    expect(tg.all('Mountain').every((id) => tg.state.objects[id].tapped)).toBe(true);
    tg.passUntil((x) => { passos.push(x.state.turn.step); return x.state.turn.step === 'main2'; });
    expect(passos.lastIndexOf('declareBlockers')).toBeGreaterThan(passos.indexOf('endCombat'));
    expect(passos.indexOf('main2')).toBe(passos.length - 1);
    expect(tg.state.turn.combatCount).toBe(2);
    // 5 + 2 de dano em cada combate
    expect(tg.life(1)).toBe(40 - 7 - 7);
  });

  it('sem pagar, não desvira nem há combate adicional', () => {
    const tg = setup({ battlefield: [[N, ...montanhas(7)], []], library: [[], ['Island']] });
    tg.attack([[N, 1]]).yes('Pagar {5}{R}{R}', false);
    tg.passTo('main2');
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.state.turn.combatCount).toBe(1);
    expect(tg.life(1)).toBe(35);
  });

  it('no combate adicional o gatilho dispara de novo e pode criar mais um combate', () => {
    const tg = setup({ battlefield: [[N, ...montanhas(14)], []], library: [[], ['Island']] });
    tg.attack([[N, 1]]).yes('Pagar {5}{R}{R}', true);
    tg.attack([[N, 1]]).yes('Pagar {5}{R}{R}', true);
    tg.attack([[N, 1]]).yes('Pagar {5}{R}{R}', false);
    tg.passTo('main2');
    expect(tg.state.turn.combatCount).toBe(3);
    expect(tg.life(1)).toBe(40 - 15);
  });
});
