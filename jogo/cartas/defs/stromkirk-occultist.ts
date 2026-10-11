// Stromkirk Occultist
// Trample
// Whenever this creature deals combat damage to a player, exile the top card of your library. Until end of turn, you may
// play that card.
// Madness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it
// into your graveyard.)
import { allowPlay, defineCard, exile, keyword, madness, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Stromkirk Occultist',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo]);
        // joga pagando os custos e no tempo normal da carta (CR 601.2, 305.1)
        if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, exile a carta do topo do seu grimório. Até o fim do turno, você pode jogar essa carta.' }),
      // CR 702.35: descartada, vai para o exílio e pode ser conjurada por {1}{R}
      madness('{1}{R}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.9a — só se descarta da mão (motor/actions.ts)',
    2: 'regra geral: CR 702.35a — vale para qualquer descarte (motor/actions.ts moveObjects)',
    3: 'regra geral: CR 702.35a — continua sendo descarte (testes/regras-conjurar.test.ts)',
    4: 'teste: conjurada pela loucura no turno de outro jogador, entra no campo',
    5: 'teste: conjurada pela loucura no turno de outro jogador, entra no campo',
    6: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
    7: 'teste: sem conjurar, vai para o cemitério',
    8: 'regra geral: CR 603.3 — o gatilho da loucura vai para a pilha acima da mágica paga com o descarte (testes/regras-conjurar.test.ts)',
    9: 'regra geral: CR 702.35a — descartada durante uma resolução, vai para o exílio e o gatilho vem depois (testes/regras-conjurar.test.ts)',
  },
});
