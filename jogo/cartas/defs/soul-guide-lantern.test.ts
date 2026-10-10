import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Soul-Guide Lantern";
describe(N, () => {
  it("entrada exila de qualquer cemitério e sacrifício exila só os cemitérios dos oponentes", () => {

    const tg = setup({ players: 4, battlefield: [['Island'], [], [], []], hand: [[N], [], [], []], graveyard: [['Forest'], ['Elvish Mystic'], ['Sol Ring'], ['Island']] }); tg.choose('carta alvo em um cemitério', ['Elvish Mystic']).cast(N).resolveAll(); expect(tg.find('Elvish Mystic', 'exile')).not.toBeNull();
    tg.activate(N, 'cemitérios').resolveAll(); expect(tg.names(0, 'graveyard')).toEqual(expect.arrayContaining(['Forest', N])); expect(tg.state.zones.graveyard.slice(1).flat()).toHaveLength(0);
  });

  it("modo de comprar exclui a fonte da geração de mana e sacrifica como custo", () => {

    const tg = setup({ battlefield: [[N, 'Island'], []] }); tg.activate(N, 'compre').resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(1); expect(tg.find(N, 'graveyard')).not.toBeNull();
  });
});
