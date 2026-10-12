import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'The One Ring';

describe(N, () => {
  it('conjurado, dá proteção contra tudo até o seu próximo turno: o dano a você é prevenido', () => {
    const tg = setup({ battlefield: [Array(4).fill('Plains'), ['Indomitable Ancients']], hand: [[N], []] });
    const vida = tg.life(0);
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(true);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(vida);
    const sem = setup({ battlefield: [[], ['Indomitable Ancients']] });
    enterCard(sem, N, 0);
    sem.resolveAll();
    dealDamage(sem.g, [{ source: sem.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(sem.life(0)).toBe(vida - 3);
  });

  it('{T}: um marcador de fardo e uma carta por marcador; na sua manutenção, perde 1 de vida por marcador', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { burden: 1 } }], []], library: [Array(6).fill('Island'), Array(3).fill('Island')] });
    const vida = tg.life(0);
    tg.activate(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.burden).toBe(2);
    expect(tg.names(0, 'hand')).toHaveLength(2);
    tg.passTo('draw', 0);
    expect(tg.life(0)).toBe(vida - 2);
  });
});