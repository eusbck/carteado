import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Killian, Decisive Mentor', () => {
  it('a criatura goadada é virada e precisa atacar outro jogador; atacar com criatura encantada compra', () => {
    const tg = setup({ players: 3, battlefield: [[{ name: 'Killian, Decisive Mentor', ready: true }, 'Plains', 'Plains'], ['Gau, Feral Youth'], []], hand: [['Spirit Mantle'], [], []], library: [['Island', 'Island'], ['Island'], ['Island']] });
    tg.choose('criatura', ['Killian, Decisive Mentor']).choose('até uma criatura alvo', ['Gau, Feral Youth']);
    tg.cast('Spirit Mantle').resolve().resolveAll();
    const gau = tg.bf('Gau, Feral Youth');
    expect(tg.state.objects[gau].tapped).toBe(true);
    expect(tg.state.objects[gau].goadedBy.map((x) => x.player)).toEqual([0]);
    tg.attack([['Killian, Decisive Mentor', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
