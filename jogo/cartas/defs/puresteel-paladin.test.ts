import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Puresteel Paladin';

describe(N, () => {
  it('Equipamento seu entrando deixa comprar; com três artefatos, os seus Equipamentos têm equipar {0}', () => {
    const tg = setup({ battlefield: [[N, 'Lotus Petal', 'Mox Opal', 'Plains', 'Plains'], []], hand: [["Hero's Blade"], []], library: [['Island', 'Island'], ['Island']] });
    tg.yes('Puresteel Paladin', true).cast("Hero's Blade").resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    // as terras ficaram viradas: só o equipar {0} dá para pagar
    tg.choose('criatura alvo que você controla', [N]).activate("Hero's Blade", 'Equipar {0}').resolveAll();
    expect(tg.state.objects[tg.bf("Hero's Blade")].attachedTo).toBe(tg.bf(N));
  });
});