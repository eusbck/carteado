import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Trazyn the Infinite';

describe(N, () => {
  it('tem as habilidades ativadas das cartas de artefato do seu cemitério, e só delas', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Endless Atlas', 'Patriot, Shield Wielder'], ['Sol Ring']], library: [['Island', 'Island'], ['Island']] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 6]);
    expect(hasKw(tg.g, tg.bf(N), 'deathtouch')).toBe(true);
    // Endless Atlas: {2}, {T}: compre uma carta, com três terrenos de mesmo nome
    tg.activate(N, 'Compre uma carta').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});