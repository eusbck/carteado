import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Voracious Fell Beast';

describe(N, () => {
  it('voar; ao entrar, cada oponente sacrifica uma criatura e você cria um Food para cada uma', () => {
    const tg = setup({ players: 3, battlefield: [['Elvish Mystic'], ['Elvish Mystic', 'Silver Myr'], []] });
    tg.choose('Sacrifique', ['Silver Myr']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.names(1, 'battlefield')).toEqual(['Elvish Mystic']);
    // a Carla não tinha criatura: um Food só
    expect(tg.all('Food')).toHaveLength(1);
    expect(tg.names(0, 'battlefield')).toContain('Elvish Mystic');
  });
});
