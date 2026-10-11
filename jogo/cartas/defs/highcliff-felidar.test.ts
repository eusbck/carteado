import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Highcliff Felidar';

describe(N, () => {
  it('vigilância; ao entrar, destrói a criatura de maior força de cada oponente, escolhendo entre as empatadas', () => {
    const tg = setup({ players: 3, battlefield: [['Elvish Mystic'], ['Keeper of Fables', 'Silver Myr'], ['Elvish Mystic', 'Silver Myr']] });
    const myr2 = tg.bf('Silver Myr', 2);
    tg.choose('Highcliff Felidar', [myr2]);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
    expect(tg.names(2, 'battlefield')).toEqual(['Elvish Mystic']);
    expect(tg.names(0, 'battlefield').sort()).toEqual(['Elvish Mystic', N].sort());
  });
});
