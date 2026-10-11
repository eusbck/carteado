import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Butcher of Malakir';

describe(N, () => {
  it('quando uma criatura sua morre, cada oponente sacrifica uma criatura; duas mortes, dois gatilhos', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Elvish Mystic', 'Silver Myr'], ['Elvish Mystic', 'Silver Myr', 'Indomitable Ancients'], ['Silver Myr']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.choose('Sacrifique', ['Elvish Mystic']);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic', 0)]));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield').sort()).toEqual(['Indomitable Ancients', 'Silver Myr']);
    expect(tg.names(2, 'battlefield')).toEqual([]);
    // ele mesmo e outra criatura sua morrendo juntos: dois gatilhos
    tg.script.length = 0;
    tg.run(destroy(tg.g, [id, tg.bf('Silver Myr', 0)]));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual([]);
  });

  it('criatura do oponente morrendo não dispara', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic', 'Silver Myr']] });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
  });
});
