// Scion of Opulence
// Whenever this creature or another nontoken Vampire you control dies, create a Treasure token. (It's an artifact with
// "{T}, Sacrifice this token: Add one mana of any color.")
// {R}, Sacrifice two artifacts: Exile the top card of your library. You may play that card this turn.
import { activated, allowPlay, cost, createTokens, defineCard, exile, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Scion of Opulence',
  faces: [{
    abilities: [
      triggered(on.dies((c, lki, old) => old.id === c.source || (lki.controller === c.you && lki.subtypes.includes('Vampire') && !old.isToken)), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que esta criatura ou outro Vampire que não é ficha que você controla morre, crie uma ficha de Treasure.' }),
      activated([...cost('{R}'), { k: 'sacrifice', n: 2, filter: is.artifact, label: 'dois artefatos' }], function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo]);
        // ruling 1: jogada no tempo normal, pagando os custos
        if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
      }, { text: '{R}, Sacrifique dois artefatos: Exile a carta do topo do seu grimório. Você pode jogar essa carta neste turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.3, 305.1 — a carta exilada é jogada no tempo normal, pagando os custos (motor/priority.ts rule:mayPlay)',
  },
});
