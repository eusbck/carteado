import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Mouth of Sauron';

describe(N, () => {
  it('o jogador alvo moi três cartas e você reúne Orcs X, com X as instantâneas e feitiços no cemitério dele', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [[], ['Languish']], library: [[], ['Consider', 'Island', 'Languish', 'Island']] });
    tg.choose('jogador alvo', ['Bruno']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 4]);
    expect(tg.names(1, 'library')).toEqual(['Island']);
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([3, 3]);
  });
});
