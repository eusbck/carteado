import { describe, expect, it } from 'vitest';
import { createTokens, putOntoBattlefield } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Anointed Procession // Anointed Procession';

describe(N, () => {
  it('cria o dobro das fichas, todas ao mesmo tempo e iguais', () => {
    const tg = setup({ battlefield: [[N], []] });
    const ids = runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    expect(ids).toHaveLength(2);
    expect(tg.all('Treasure')).toHaveLength(2);
    // as fichas do oponente não dobram
    runEffect(tg, createTokens(tg.g, 1, 'Treasure', 1));
    expect(tg.all('Treasure')).toHaveLength(3);
  });

  it('o dobro de cada tipo de ficha', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, putOntoBattlefield(tg.g, [{ controller: 0, token: { def: 'Treasure' } }, { controller: 0, token: { def: 'Cat verde 1/1' } }, { controller: 0, token: { def: 'Cat verde 1/1' } }], 'token'));
    expect(tg.all('Treasure')).toHaveLength(2);
    expect(tg.all('Cat')).toHaveLength(4);
  });

  it('com duas Anointed Procession, quatro vezes as fichas', () => {
    const tg = setup({ battlefield: [[N, N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    expect(tg.all('Treasure')).toHaveLength(4);
  });

  it('o que o efeito manda fazer depois com as fichas vale para todas', () => {
    // Goldlust Triad: a miríade cria uma cópia atacando o outro oponente e exila as fichas no fim do combate
    const tg = setup({ players: 3, battlefield: [[N, 'Goldlust Triad'], [], []] });
    tg.yes('Miríade', true).attack([['Goldlust Triad', 1]]);
    tg.passTo('declareBlockers');
    // duas cópias viradas e atacando, além da original
    const copias = tg.all('Goldlust Triad').filter((id) => tg.state.objects[id].isToken);
    expect(copias).toHaveLength(2);
    expect(copias.every((id) => tg.state.objects[id].tapped && tg.state.combat!.attackers.some((a) => a.id === id))).toBe(true);
    tg.passTo('main2');
    expect(tg.all('Goldlust Triad')).toHaveLength(1);
  });
});
