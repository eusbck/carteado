// Ragavan, Nimble Pilferer
// Whenever Ragavan deals combat damage to a player, create a Treasure token and exile the top card of that player's
// library. Until end of turn, you may cast that card.
// Dash {1}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the
// battlefield to its owner's hand at the beginning of the next end step.)
import { allowPlay, createTokens, dash, defineCard, moveObjects, nameOf, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const DASH = dash('{1}{R}');

export default defineCard({
  name: 'Ragavan, Nimble Pilferer',
  faces: [{
    altCosts: [DASH.altCost],
    abilities: [
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const g = c.g;
        const p = c.event.player as PlayerId;
        // ruling 1: o Tesouro vem mesmo com o grimório vazio
        yield* createTokens(g, c.you, 'Treasure', 1);
        const topo = g.state.zones.library[p]?.[0];
        if (topo === undefined) return;
        const [ex] = yield* moveObjects(g, [{ id: topo, to: 'exile' }], 'exile');
        if (ex === null || ex === undefined) return;
        g.log(`${g.state.players[c.you].name} exila ${nameOf(g, ex)} do topo do grimório de ${g.state.players[p].name}.`);
        // ruling 2: só conjurar (terreno não se joga), pagando os custos e no tempo normal
        allowPlay(g, c.you, c.source, [ex], { kind: 'endOfTurn' }, { spellsOnly: true });
      }, { text: 'Sempre que Ragavan causa dano de combate a um jogador, crie uma ficha de Tesouro e exile a carta do topo do grimório desse jogador. Até o fim do turno, você pode conjurar essa carta.' }),
      ...DASH.abilities,
    ],
  }],
  rulings: {
    1: 'teste: com o grimório do jogador vazio, ainda cria o Tesouro',
    2: 'teste: até o fim do turno pode conjurar a carta exilada pagando o custo; terreno não',
    3: 'regra geral: CR 702.109a, 601.2 — com dash a mágica vai para a pilha como sempre e segue o tempo normal (motor/stack.ts)',
    4: 'teste: com dash tem ímpeto e volta para a mão no início da próxima etapa final',
    5: 'regra geral: CR 508.1 — dash não obriga a atacar',
    6: 'regra geral: CR 707.2 — a cópia não tem o custo de dash pago: nem ímpeto nem volta (motor/cedh.ts dashed)',
  },
});
