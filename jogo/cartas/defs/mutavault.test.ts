import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

const NOME = 'Mutavault';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{1}: vira uma criatura 2/2 com todos os tipos de criatura até o fim do turno, sem changeling, e continua terreno', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []] });
    tg.activate(NOME, 'criatura').resolve();
    const id = tg.bf(NOME);
    const c = chars(tg.g, id);
    expect(c.types.sort()).toEqual(['Creature', 'Land']);
    expect(c.subtypes).toContain('Elf');
    expect(c.subtypes).toContain('Vulcan');
    expect(hasKw(tg.g, id, 'changeling')).toBe(false);
    expect(tg.pt(id)).toEqual([2, 2]);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, id).types).toEqual(['Land']);
  });
});
