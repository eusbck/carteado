import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fierce Guardianship';

describe(N, () => {
  it('controlando um comandante, anula a mágica que não é de criatura sem pagar o custo de mana', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: 'Elvish Mystic', commander: true, tapped: true }], ['Forest']], hand: [[N], ['Sol Ring']] });
    tg.cast('Sol Ring').pass();
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Sol Ring') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.cast(N, 'gratis').resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });

  it('sem comandante, o custo normal é exigido', () => {
    const tg = setup({ active: 1, battlefield: [['Elvish Mystic'], ['Forest']], hand: [[N], ['Sol Ring']] });
    tg.cast('Sol Ring').pass();
    expect(tg.canCast(N)).toBe(false);
  });
});