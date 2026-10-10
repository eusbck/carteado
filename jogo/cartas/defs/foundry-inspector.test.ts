import { describe, expect, it } from 'vitest';
import { formatCost, manaValue } from '../../motor/api.ts';
import { totalSpellCost } from '../../motor/stack.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Foundry Inspector";
describe(N, () => {
  it("reduz só mana genérica de artefatos sem alterar seu valor de mana", () => {

    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Ornithopter of Paradise', 'Etherium Sculptor'], []] });
    tg.cast('Ornithopter of Paradise'); expect(manaValue(tg.g, tg.state.zones.stack.at(-1)!)).toBe(2); tg.resolveAll();
    tg.state.objects[tg.bf('Island')].tapped = false; tg.g.bump(); tg.refresh(); expect(tg.canCast('Etherium Sculptor')).toBe(true); tg.cast('Etherium Sculptor');
    expect(tg.state.players[0].manaPool).toHaveLength(0); expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });

  it("reduz X escolhido antes do custo total de um artefato", () => {

    const tg = setup({ battlefield: [[N], []], hand: [['Royal Talon Fighter Jet'], []] });
    const card = tg.state.objects[tg.find('Royal Talon Fighter Jet', 'hand')!];
    expect(formatCost(totalSpellCost(tg.g, 0, card, { key: 'hand', label: 'conjurar', zone: 'hand' }, { x: 4, targets: [], paid: {} }))).toBe('{3}{W}{W}');
  });
});
