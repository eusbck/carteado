import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Mondrak, Glory Dominus';

describe(N, () => {
  it('cria o dobro das fichas sob o seu controle; as do oponente não', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(runEffect(tg, createTokens(tg.g, 0, 'Treasure', 2))).toHaveLength(4);
    runEffect(tg, createTokens(tg.g, 1, 'Treasure', 1));
    expect(tg.all('Treasure')).toHaveLength(5);
  });

  it('o dobro das fichas; as fichas a mais entram viradas e atacando como as originais', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Goldlust Triad'], [], []] });
    tg.yes('Miríade', true).attack([['Goldlust Triad', 1]]);
    tg.passTo('declareBlockers');
    const copias = tg.all('Goldlust Triad').filter((id) => tg.state.objects[id].isToken);
    expect(copias).toHaveLength(2);
    expect(copias.every((id) => tg.state.objects[id].tapped && tg.state.combat!.attackers.some((a) => a.id === id))).toBe(true);
  });

  it('CR 107.4f: {1}{W/P}{W/P} e sacrificar dois outros artefatos e/ou criaturas: marcador de indestrutível', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Elvish Mystic', 'Plains', 'Plains'], []] });
    // duas Plains pagam {1}{W}; o outro {W/P} sai com 2 de vida
    let vida = false;
    tg.script.push((d) => (d.kind === 'payment' && !vida ? ((vida = true), { kind: 'payment', life: 1 }) : null));
    tg.choose('Sacrifique', ['Sol Ring', 'Elvish Mystic']).activate(N, 'indestrutível').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf(N)].counters.indestructible).toBe(1);
    expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(true);
    expect(tg.life(0)).toBe(38);
  });
});
