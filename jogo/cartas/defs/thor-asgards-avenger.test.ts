import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Thor, Asgard's Avenger";

describe(N, () => {
  it('voar; outra fonte sua causa 1 de dano a mais a oponentes e às permanentes deles; o próprio Thor, não', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Wall of Omens'], ['Indomitable Ancients']] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    const alvo = tg.bf('Indomitable Ancients');
    const vida = tg.life(1);
    dealDamage(tg.g, [{ source: tg.bf('Silver Myr'), target: { kind: 'obj', id: alvo }, amount: 1, combat: false }, { source: tg.bf('Silver Myr'), target: { kind: 'player', id: 1 }, amount: 2, combat: false }]);
    expect(tg.state.objects[alvo].damage).toBe(2);
    expect(tg.life(1)).toBe(vida - 3);
    dealDamage(tg.g, [{ source: tg.bf(N), target: { kind: 'obj', id: alvo }, amount: 1, combat: false }]);
    expect(tg.state.objects[alvo].damage).toBe(3);
    // dano às suas próprias permanentes e o dano das fontes dos oponentes não mudam
    dealDamage(tg.g, [{ source: tg.bf('Silver Myr'), target: { kind: 'obj', id: tg.bf('Wall of Omens') }, amount: 1, combat: false }, { source: alvo, target: { kind: 'obj', id: tg.bf(N) }, amount: 1, combat: false }]);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(1);
    expect(tg.state.objects[tg.bf(N)].damage).toBe(1);
  });
});