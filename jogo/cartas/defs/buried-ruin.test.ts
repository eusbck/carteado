import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Buried Ruin";
describe(N, () => {
  it("produz incolor ou sacrifica para devolver artefato do próprio cemitério", () => {

    const mana = setup({ battlefield: [[N], []] }); activateMana(mana, N, 'C'); expect(mana.state.players[0].manaPool[0].type).toBe('C');
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], graveyard: [['Sol Ring'], []] }); tg.choose('carta de artefato alvo', ['Sol Ring']).activate(N).resolveAll(); expect(tg.names(0, 'hand')).toEqual(['Sol Ring']); expect(tg.find(N, 'graveyard')).not.toBeNull();
  });
});
