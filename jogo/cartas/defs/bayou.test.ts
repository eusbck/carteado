import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Bayou';

describe(NOME, () => {
  it('CR 305.6: mana dos dois tipos básicos de terreno', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'G']));
  it('CR 305.8: tem os tipos básicos, mas não é terreno básico', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const c = chars(tg.g, tg.bf(NOME));
    expect(c.subtypes).toEqual(['Swamp', 'Forest']);
    expect(c.supertypes).not.toContain('Basic');
  });
});
