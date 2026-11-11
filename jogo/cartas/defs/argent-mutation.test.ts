import { describe, expect, it } from 'vitest';
import { chars, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Argent Mutation';
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('o permanente alvo vira artefato além dos outros tipos até o fim do turno; você compra', () => {
    const tg = setup({ battlefield: [ilhas, ['Elvish Mystic']], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('permanente alvo', ['Elvish Mystic']).cast(N).resolve();
    expect(chars(tg.g, tg.bf('Elvish Mystic')).types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, tg.bf('Elvish Mystic')).types).toEqual(['Creature']);
  });
  it('mirando um artefato, só compra a carta', () => {
    const tg = setup({ battlefield: [ilhas, ['Sol Ring']], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('permanente alvo', ['Sol Ring']).cast(N).resolve();
    expect(chars(tg.g, tg.bf('Sol Ring')).types).toEqual(['Artifact']);
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
  });
  it('com o alvo ilegal na resolução, não resolve e você não compra', () => {
    const tg = setup({ battlefield: [ilhas, ['Elvish Mystic']], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('permanente alvo', ['Elvish Mystic']).cast(N);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
