import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Voice of Resurgence';

describe(N, () => {
  it('um oponente conjurando uma mágica no seu turno cria o Elemental antes de a mágica resolver', () => {
    const tg = setup({ battlefield: [[N], ['Island']], hand: [[], ['Consider']] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    tg.cast('Consider').resolve();
    expect(tg.find('Elemental')).not.toBeNull();
    expect(tg.state.zones.stack).toHaveLength(1);
  });

  it('a força e a resistência do Elemental acompanham o número de criaturas que você controla, contando ele mesmo', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    const ficha = tg.bf('Elemental');
    expect(tg.pt(ficha)).toEqual([2, 2]);
    enterCard(tg, 'Elvish Mystic', 0);
    expect(tg.pt(ficha)).toEqual([3, 3]);
  });

  it('a mágica do oponente no turno dele não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island']], hand: [[], ['Consider']] });
    tg.cast('Consider').resolveAll();
    expect(tg.find('Elemental')).toBeNull();
  });
});