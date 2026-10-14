import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Prisoner's Dilemma";
const MANA = ['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'];

function jogo(escolhas: [string, string]) {
  const tg = setup({ players: 3, battlefield: [MANA, [], []], hand: [[NOME], [], []] });
  tg.choose("Prisoner's Dilemma", [escolhas[0]]);
  tg.choose("Prisoner's Dilemma", [escolhas[1]]);
  tg.cast(NOME).resolve();
  return tg;
}

describe(NOME, () => {
  it('as escolhas são feitas na resolução: todos em silêncio levam 4; todos delatando, 8; misturado, só quem ficou em silêncio leva 12', () => {
    let tg = jogo(['Silêncio', 'Silêncio']);
    expect([tg.life(1), tg.life(2)]).toEqual([36, 36]);
    tg = jogo(['Delatar', 'Delatar']);
    expect([tg.life(1), tg.life(2)]).toEqual([32, 32]);
    tg = jogo(['Silêncio', 'Delatar']);
    expect([tg.life(1), tg.life(2)]).toEqual([28, 40]);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });

  it('retrospectiva {5}{R}{R}: do cemitério, e depois vai para o exílio', () => {
    const tg = setup({ players: 3, battlefield: [[...MANA, 'Mountain', 'Mountain'], [], []], graveyard: [[NOME], [], []] });
    tg.choose("Prisoner's Dilemma", ['Silêncio']).choose("Prisoner's Dilemma", ['Silêncio']);
    tg.cast(NOME, 'flashback').resolve();
    expect([tg.life(1), tg.life(2)]).toEqual([36, 36]);
    expect(tg.names(0, 'exile')).toEqual([NOME]);
  });
});
