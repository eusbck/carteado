import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

describe('Excava, the Risen Past', () => {
  it('artefato devolvido vira criatura Spirit 1/1 com voar; com finalidade, ao morrer vai para o exílio', () => {
    const tg = setup({ battlefield: [['Excava, the Risen Past'], []], graveyard: [['Sol Ring'], []] });
    tg.choose('até uma carta alvo', ['Sol Ring']);
    tg.attack([['Excava, the Risen Past', 1]]).passTo('declareBlockers');
    const s = tg.bf('Sol Ring');
    expect(chars(tg.g, s).types.sort()).toEqual(['Artifact', 'Creature']);
    expect(chars(tg.g, s).subtypes).toContain('Spirit');
    expect(tg.pt(s)).toEqual([1, 1]);
    expect(hasKw(tg.g, s, 'flying')).toBe(true);
    tg.run(destroy(tg.g, [s]));
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
  });
});
