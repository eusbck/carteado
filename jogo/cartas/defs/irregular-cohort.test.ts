import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('Irregular Cohort', () => {
  it('é de todos os tipos de criatura e cria um Metamorfo 2/2 com polimorfo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Irregular Cohort'], []] });
    tg.cast('Irregular Cohort').resolve();
    tg.resolveAll();
    expect(chars(tg.g, tg.bf('Irregular Cohort')).subtypes).toEqual(expect.arrayContaining(['Elf', 'Wolf']));
    const ficha = tg.bf('Shapeshifter');
    expect(tg.pt(ficha)).toEqual([2, 2]);
    expect(chars(tg.g, ficha).subtypes).toEqual(expect.arrayContaining(['Elf', 'Wolf']));
  });
});
