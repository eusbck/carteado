import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = "Vault of Whispers";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B"]));
  it('é um terreno artefato', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).types.sort()).toEqual(['Artifact', 'Land']);
  });
});
