import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Rootcast Apprenticeship';
const MANA = ['Forest', 'Forest', 'Forest', 'Forest'];

describe(NOME, () => {
  it('três vezes o mesmo modo: seis marcadores na criatura alvo', () => {
    const tg = setup({ battlefield: [[...MANA, 'Wall of Omens'], []], hand: [[NOME], []] });
    for (let i = 0; i < 3; i++) tg.choose('escolha o modo', ['Coloque dois marcadores +1/+1 na criatura alvo']);
    tg.cast(NOME).resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1']).toBe(6);
  });

  it('modos diferentes: Squirrel para o jogador alvo, cópia da ficha e sacrifício do oponente', () => {
    const tg = setup({ battlefield: [[...MANA, { name: 'Food', token: true }], ['Sol Ring']], hand: [[NOME], []] });
    tg.choose('escolha o modo', ['Crie uma ficha que é uma cópia da ficha alvo que você controla']);
    tg.choose('escolha o modo', ['O jogador alvo cria uma ficha de criatura Squirrel verde 1/1']);
    tg.choose('escolha o modo', ['O oponente alvo sacrifica um artefato que não é ficha à escolha dele']);
    tg.choose('jogador alvo', ['Bruno']);
    tg.cast(NOME).resolve();
    expect(tg.all('Food').length).toBe(2);
    expect(tg.find('Squirrel', 'battlefield', 1)).not.toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });
});
