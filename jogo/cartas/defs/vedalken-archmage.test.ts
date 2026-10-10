import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Vedalken Archmage";
describe(N, () => {
  it("compra por conjurar artefato, sem disparar por jogar artefato terreno", () => {

    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Aether Spellbomb', 'Darksteel Citadel'], []] }); tg.play('Darksteel Citadel'); expect(tg.state.zones.stack).toHaveLength(0); tg.cast('Aether Spellbomb').resolve(); expect(tg.state.zones.hand[0]).toHaveLength(1); expect(tg.find('Aether Spellbomb')).toBeNull();
  });
});
