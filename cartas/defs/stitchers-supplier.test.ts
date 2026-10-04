import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Stitcher's Supplier", () => {
  it('ao entrar e ao morrer, moa três cartas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [["Stitcher's Supplier", 'Infernal Grasp'], []], library: [Array(7).fill('Island'), []] });
    tg.cast("Stitcher's Supplier").resolve().resolve();
    expect(tg.names(0, 'graveyard').length).toBe(3);
    tg.choose('criatura alvo', ["Stitcher's Supplier"]).cast('Infernal Grasp').resolve().resolve();
    expect(tg.names(0, 'library').length).toBe(1);
  });
});
