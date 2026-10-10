import { describe, expect, it } from 'vitest';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Shimmer Myr";
describe(N, () => {
  it("artefatos têm tempo de instantânea enquanto está no campo; terreno artefato não", () => {

    const tg = setup({ step: 'upkeep', battlefield: [[N, 'Island'], []], hand: [['Aether Spellbomb', 'Darksteel Citadel'], []] }); expect(tg.canCast('Aether Spellbomb')).toBe(true);
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some(a => a.kind === 'play' && a.obj === tg.find('Darksteel Citadel', 'hand'))).toBe(false); removeCard(tg, tg.bf(N)); expect(tg.canCast('Aether Spellbomb')).toBe(false);
  });
});
