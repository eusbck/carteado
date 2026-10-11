import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Storm, Queen of Wakanda';

describe(N, () => {
  it('voar; atacando, outra atacante alvo ganha voar e +X/+0, X igual à força de Storm', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.choose('outra criatura atacante alvo', ['Silver Myr']);
    tg.attack([[N, 1], ['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([5, 1]);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'flying')).toBe(true);
  });

  it('a criatura com voar que ataca você leva dano igual à força de Storm', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Serra Angel', 'Indomitable Ancients']] });
    tg.attack([['Serra Angel', 0], ['Indomitable Ancients', 0]]).passTo('declareBlockers');
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
  });
});