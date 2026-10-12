import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Avenge';

describe(N, () => {
  it('destrói todas as criaturas e você ganha 1 de vida para cada uma destruída; indestrutível não conta', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Plains'), 'Silver Myr', 'Captain Marvel, Apex Avenger'], ['Serra Angel']], hand: [[N], []] });
    const vida = tg.life(0);
    tg.cast(N).resolveAll();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.find('Captain Marvel, Apex Avenger')).not.toBeNull();
    expect(tg.life(0)).toBe(vida + 2);
  });

  it('custa {2} a menos se um jogador atacou você no último turno dele', () => {
    const tg = setup({ active: 1, battlefield: [Array(4).fill('Plains'), ['Serra Angel']], hand: [[N], []] });
    tg.attack([['Serra Angel', 0]]).passTo('main1', 0);
    expect(tg.canCast(N)).toBe(true);
    const sem = setup({ battlefield: [Array(4).fill('Plains'), ['Serra Angel']], hand: [[N], []] });
    expect(sem.canCast(N)).toBe(false);
  });
});