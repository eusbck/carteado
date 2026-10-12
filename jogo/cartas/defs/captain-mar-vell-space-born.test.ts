import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Captain Mar-Vell, Space-Born';

describe(N, () => {
  it('voar e vigilância; depois que um oponente conjura uma mágica no turno, você conjura como se tivesse lampejo', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Forest', 'Forest'], ['Forest', 'Forest']], hand: [['Silver Myr'], ['Elvish Mystic']] });
    for (const kw of ['flying', 'vigilance']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    tg.pass();
    expect(tg.canCast('Silver Myr')).toBe(false);
    const outro = setup({ active: 1, battlefield: [[N, 'Forest', 'Forest'], ['Forest', 'Forest']], hand: [['Silver Myr'], ['Elvish Mystic']] });
    outro.cast('Elvish Mystic').resolveAll();
    outro.pass();
    expect(outro.canCast('Silver Myr')).toBe(true);
  });
});