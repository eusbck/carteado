import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { chars } from '../../motor/api.ts';

const F = 'Firdoch Core';

describe(F, () => {
  it('CR 605: uma mana de qualquer cor', () => expect(alternativasDeMana(F)).toEqual(['B', 'G', 'R', 'U', 'W']));
  it('é de todos os tipos de criatura sem ser criatura; com {4}, vira criatura artefato 4/4 até o fim do turno', () => {
    const tg = setup({ battlefield: [[F, 'Sol Ring', 'Sol Ring'], []], library: [['Island'], ['Island']] });
    const id = tg.bf(F);
    let c = chars(tg.g, id);
    expect(c.types).toEqual(['Kindred', 'Artifact']);
    expect(c.subtypes).toEqual(expect.arrayContaining(['Shapeshifter', 'Dragon', 'Elf']));
    tg.activate(F, '{4}').resolve();
    c = chars(tg.g, id);
    expect(c.types).toContain('Creature');
    expect(c.types).toContain('Artifact');
    expect(tg.pt(id)).toEqual([4, 4]);
    tg.passTo('main1', 1);
    expect(chars(tg.g, id).types).not.toContain('Creature');
  });
  it('na mão também é de todos os tipos de criatura', () => {
    const tg = setup({ hand: [[F], []] });
    expect(chars(tg.g, tg.find(F, 'hand')!).subtypes).toContain('Dragon');
  });
});
