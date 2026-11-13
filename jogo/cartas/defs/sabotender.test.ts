import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sabotender', () => {
  it('um terreno posto no campo por um efeito também dispara', () => {
    const tg = setup({ battlefield: [['Sabotender', 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Splendid Reclamation'], []], graveyard: [['Mountain', 'Mountain'], []] });
    tg.cast('Splendid Reclamation').resolveAll();
    expect(tg.life(1)).toBe(38);
  });
});
