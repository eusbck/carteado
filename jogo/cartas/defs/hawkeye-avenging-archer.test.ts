import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Hawkeye, Avenging Archer';

describe(N, () => {
  it('alcance; {T}: 1 de dano; compra quando morre uma criatura de oponente que ele feriu neste turno', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic', 'Silver Myr']], library: [['Island', 'Island'], ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'reach')).toBe(true);
    tg.choose('qualquer alvo', ['Elvish Mystic']).activate(N).resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    // a que ele não feriu não dá carta
    removeCard(tg, tg.bf('Silver Myr'));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});