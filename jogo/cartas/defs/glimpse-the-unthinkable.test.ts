import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Glimpse the Unthinkable';

describe(N, () => {
  it('o jogador alvo mói dez cartas', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], hand: [[N], []], library: [[], Array<string>(12).fill('Hex')] });
    tg.choose('jogador alvo', ['Bruno']).cast(N).resolve();
    expect(tg.names(1, 'graveyard').length).toBe(10);
    expect(tg.names(1, 'library').length).toBe(2);
  });
});
