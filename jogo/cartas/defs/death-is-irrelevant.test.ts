import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('Death Is Irrelevant', () => {
  it('assimila uma criatura de um cemitério na etapa final; artefatos-criatura indestrutíveis', () => {
    const tg = setup({ battlefield: [['Death Is Irrelevant'], []], graveyard: [[], ['Elvish Mystic']], library: [['Opt'], ['Opt']] });
    tg.choose('carta de criatura', ['Elvish Mystic']);
    tg.passTo('end').resolveAll();
    const elfo = tg.bf('Elvish Mystic', 0);
    const c = chars(tg.g, elfo);
    expect(c.types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(c.subtypes).toEqual(['Borg']);
    expect(tg.pt(elfo)).toEqual([2, 2]);
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(true);
  });
});
