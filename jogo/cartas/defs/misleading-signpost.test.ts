import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Misleading Signpost";
describe(N, () => {
  it("muda defensor ignorando Propaganda sem emitir ataque novo", () => {

    const tg = setup({ players: 3, battlefield: [['Elvish Mystic'], ['Island', 'Island', 'Island'], ['Propaganda']], hand: [[], [N], []] }); tg.attack([['Elvish Mystic', 1]]).passTo('declareAttackers').pass();
    tg.choose('criatura atacante alvo', ['Elvish Mystic']).choose('Misleading Signpost:', ['Carla']).cast(N).resolveAll(); expect(tg.state.combat!.attackers[0].target).toEqual({ kind: 'player', id: 2 }); expect(tg.state.turnStats[0].attackedPlayers).toEqual([1]); tg.passTo('main2'); expect(tg.life(2)).toBe(39); expect(tg.life(1)).toBe(40);
  });

  it("fora da declaração só entra e produz azul sem gatilho de reseleção", () => {

    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []] }); tg.cast(N).resolveAll(); expect(tg.state.zones.stack).toHaveLength(0); activateMana(tg, N, 'U'); expect(tg.state.players[0].manaPool.map(u => u.type)).toEqual(['U']);
  });
});
