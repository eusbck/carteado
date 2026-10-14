import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { temPalavrasChave } from '../../testes/padroes.ts';

const N = 'Carnage Tyrant';

describe(N, () => {
  it('esta mágica não pode ser anulada', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Forest')], ['Island', 'Island']], hand: [[N], ['Counterspell']] });
    tg.cast(N).pass();
    tg.choose('mágica alvo', [N]).cast('Counterspell').resolve().resolve();
    expect(tg.find(N)).not.toBeNull();
  });
  it('atropelar e resistência a magia', () => expect(temPalavrasChave(N, 'trample', 'hexproof')).toBe(true));
});
