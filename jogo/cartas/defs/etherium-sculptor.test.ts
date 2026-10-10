import { describe, expect, it } from 'vitest';
import { manaValue } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Etherium Sculptor";
describe(N, () => {
  it("reduz só mana genérica de artefatos sem alterar seu valor de mana", () => {

    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Ornithopter of Paradise', 'Etherium Sculptor'], []] });
    tg.cast('Ornithopter of Paradise'); expect(manaValue(tg.g, tg.state.zones.stack.at(-1)!)).toBe(2); tg.resolveAll();
    tg.state.objects[tg.bf('Island')].tapped = false; tg.g.bump(); tg.refresh(); expect(tg.canCast('Etherium Sculptor')).toBe(true); tg.cast('Etherium Sculptor');
    expect(tg.state.players[0].manaPool).toHaveLength(0); expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
});
