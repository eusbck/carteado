import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Lonely Sandbar";
describe(N, () => {
  it("entra virado, produz azul e cicla da mão descartando como custo", () => {

    const tg = setup({ hand: [[N], []] }); tg.play(N); expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    tg.state.objects[tg.bf(N)].tapped = false; tg.g.bump(); tg.refresh(); activateMana(tg, N, 'U'); expect(tg.state.players[0].manaPool.map(u => u.type)).toEqual(['U']);
    const cycling = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []] }); cycling.activate(N).resolveAll();
    expect(cycling.find(N, 'graveyard')).not.toBeNull(); expect(cycling.state.zones.hand[0]).toHaveLength(1);
  });
});
