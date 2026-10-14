import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Metropolis Reformer';

describe(N, () => {
  it('você tem resistência a magia: o oponente não mira você', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Plains', 'Plains', 'Plains']], hand: [[], ['Secret Rendezvous']] });
    expect(tg.canCast('Secret Rendezvous')).toBe(false);
  });

  it('sofrendo dano, você ganha essa quantidade de vida', () => {
    const tg = setup({ battlefield: [[N], ['Thieving Amalgam']] });
    dealDamage(tg.g, [{ source: tg.bf('Thieving Amalgam'), target: { kind: 'obj', id: tg.bf(N) }, amount: 2, combat: false }]);
    tg.refresh();
    tg.resolveAll();
    expect(tg.life(0)).toBe(42);
  });
});
