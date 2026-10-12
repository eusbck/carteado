import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Rat King, Pale Piper';

describe(N, () => {
  it('ameaçar; cria um Rat quando ele ou outra criatura sua que não é ficha sai do campo; {2} e uma ficha: compra', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Swamp', 'Swamp'], []], library: [['Island', 'Island'], ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    removeCard(tg, tg.bf('Silver Myr'));
    tg.resolveAll();
    expect(tg.all('Rat')).toHaveLength(1);
    tg.choose('Sacrifique', ['Rat']).activate(N).resolveAll();
    // a ficha que sai não cria outra
    expect(tg.all('Rat')).toHaveLength(0);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.all('Rat')).toHaveLength(1);
  });
});