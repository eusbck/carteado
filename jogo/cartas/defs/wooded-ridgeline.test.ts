import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Wooded Ridgeline';

describe(NOME, () => {
  it('CR 305.6: mana dos tipos Mountain e Forest', () => expect(alternativasDeMana(NOME)).toEqual(['G', 'R']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 305.8: tem os tipos Mountain e Forest, mas não é básico', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).subtypes).toEqual(['Mountain', 'Forest']);
    expect(chars(tg.g, tg.bf(NOME)).supertypes).toEqual([]);
  });
});
