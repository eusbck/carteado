import { describe, expect, it } from 'vitest';
import { untap } from '../../motor/api.ts';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Fall from Favor";
describe(N, () => {
  it("entra, vira e faz monarca; controlador não monarca não desvira mas ainda pode desvirar por efeito", () => {

    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Elvish Mystic']], hand: [[N], []] }); tg.choose('criatura alvo', ['Elvish Mystic']).cast(N).resolveAll(); expect(tg.state.monarch).toBe(0); expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
    tg.passTo('upkeep', 1); expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true); untap(tg.g, tg.bf('Elvish Mystic')); expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
  });

  it("alvo que sai impede a Aura de entrar e não dá título de monarca", () => {

    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Elvish Mystic']], hand: [[N], []] }); tg.choose('criatura alvo', ['Elvish Mystic']).cast(N); removeCard(tg, tg.bf('Elvish Mystic')); tg.resolveAll(); expect(tg.state.monarch).toBeNull(); expect(tg.find(N, 'graveyard')).not.toBeNull();
  });
});
