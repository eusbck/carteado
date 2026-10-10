import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Thirst for Knowledge";
describe(N, () => {
  it("permite um artefato ou duas cartas e mantém a ordem comprar antes de descartar", () => {

    const artifact = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Sol Ring', 'Forest', 'Forest'], ['Island']] }); artifact.choose('escolha o descarte', ['artifact']).choose('Descarte', ['Sol Ring']).cast(N).resolveAll(); expect(artifact.state.zones.hand[0]).toHaveLength(2); expect(artifact.find('Sol Ring', 'graveyard')).not.toBeNull();
    const two = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Sol Ring', 'Sol Ring', 'Forest'], ['Island']] }); two.choose('escolha o descarte', ['two']).choose('Descarte', ['Sol Ring', 'Sol Ring']).cast(N).resolveAll(); expect(two.names(0, 'hand')).toEqual(['Forest']);
  });
});
