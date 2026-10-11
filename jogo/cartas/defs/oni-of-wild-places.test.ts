import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Oni of Wild Places';

describe(N, () => {
  it('ímpeto; na sua manutenção, devolve uma criatura vermelha sua para a mão do dono', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Furnace Whelp', 'Indomitable Ancients'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([6, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
    tg.choose('devolva uma criatura vermelha', ['Furnace Whelp']);
    tg.passTo('main1', 0);
    expect(tg.names(0, 'hand')).toContain('Furnace Whelp');
    expect(tg.find(N)).not.toBeNull();
  });

  it('sendo a única criatura vermelha, volta ela mesma', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Indomitable Ancients'], []] });
    tg.passTo('main1', 0);
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'hand')).toContain(N);
  });
});