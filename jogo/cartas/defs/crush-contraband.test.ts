import { describe, expect, it } from 'vitest';
import { removeCard } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Crush Contraband';

describe(N, () => {
  it('com os dois modos, se um alvo ficar ilegal, o outro ainda é exilado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], ['Sol Ring', 'Colossal Majesty']], hand: [[N], []] });
    tg.choose('modo', ['Exile o artefato alvo', 'Exile o encantamento alvo']).choose('artefato alvo', ['Sol Ring']).choose('encantamento alvo', ['Colossal Majesty']);
    tg.cast(N);
    removeCard(tg, tg.bf('Sol Ring'));
    tg.resolve();
    expect(tg.names(1, 'exile')).toEqual(['Colossal Majesty']);
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });
});
