import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Shalai, Voice of Plenty', () => {
  it('você e suas outras criaturas têm resistência a magia; Shalai não', () => {
    const tg = setup({ active: 1, battlefield: [['Shalai, Voice of Plenty', 'Wall of Omens'], ['Mountain', 'Mountain']], hand: [[], ['Abrade']] });
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'hexproof')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Shalai, Voice of Plenty'), 'hexproof')).toBe(false);
    let alvos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('alvo') ? (alvos = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.choose('modo', ['Causa 3 de dano à criatura alvo']);
    tg.cast('Abrade');
    expect(alvos).toEqual(['Shalai, Voice of Plenty']);
  });
  it('{4}{G}{G}: marcador +1/+1 em cada criatura sua', () => {
    const tg = setup({ battlefield: [['Shalai, Voice of Plenty', 'Wall of Omens', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []] });
    tg.activate('Shalai, Voice of Plenty').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
    expect(tg.pt(tg.bf('Shalai, Voice of Plenty'))).toEqual([4, 5]);
  });
});
