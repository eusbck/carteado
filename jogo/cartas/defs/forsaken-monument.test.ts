import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Forsaken Monument";
describe(N, () => {
  it("mana adicional resolve imediatamente uma vez por ativação e o planejador a considera", () => {

    const tg = setup({ battlefield: [[N, 'Sol Ring'], []], hand: [['Foundry Inspector'], []] }); expect(tg.canCast('Foundry Inspector')).toBe(true); tg.cast('Foundry Inspector'); expect(tg.state.players[0].manaPool).toHaveLength(0);
    tg.resolveAll(); expect(tg.life(0)).toBe(42); expect(tg.pt(tg.bf('Foundry Inspector'))).toEqual([5, 4]);
    const mana = setup({ battlefield: [[N, 'Sol Ring'], []] }); activateMana(mana, 'Sol Ring', 'C'); expect(mana.state.players[0].manaPool.map(u => u.type).join('')).toBe('CCC'); expect(mana.state.zones.stack).toHaveLength(0);
  });
});
