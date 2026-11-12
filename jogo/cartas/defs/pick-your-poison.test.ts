import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Pick Your Poison';

describe(N, () => {
  it('cada oponente sacrifica uma criatura com voar; as sem voar ficam', () => {
    const tg = setup({ battlefield: [['Forest', 'Serra Angel'], ['Serra Angel', 'Indomitable Ancients']], hand: [[N], []] });
    tg.choose('modo', ['Cada oponente sacrifica uma criatura com voar à escolha dele']).cast(N).resolve();
    expect(tg.all('Serra Angel').length).toBe(1);
    expect(tg.find('Serra Angel', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
  it('o artefato', () => {
    const tg = setup({ battlefield: [['Forest'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('modo', ['Cada oponente sacrifica um artefato à escolha dele']).cast(N).resolve();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
