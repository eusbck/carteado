import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Hedron Archive";
describe(N, () => {
  it("produz duas mana ou sacrifica para comprar duas", () => {

    const tg = setup({ battlefield: [[N], []] }); activateMana(tg, N, 'C'); expect(tg.state.players[0].manaPool.map(u => u.type).join('')).toBe('CC');
    const drawing = setup({ battlefield: [[N, 'Sol Ring'], []] }); drawing.activate(N, 'compre').resolveAll(); expect(drawing.find(N, 'graveyard')).not.toBeNull(); expect(drawing.state.zones.hand[0]).toHaveLength(2);
  });
});
