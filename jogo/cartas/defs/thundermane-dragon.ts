// Thundermane Dragon
// Flying
// You may look at the top card of your library any time.
// You may cast creature spells with power 4 or greater from the top of your library. If you cast a creature spell this
// way, it gains haste until end of turn.
import { defineCard, isCreature, keyword, power, spellGainsUntilEndOfTurn, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Thundermane Dragon',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-2: informação que só você vê, sem usar a pilha (motor/view.ts)
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            if (p !== c.you || c.g.state.zones.library[p][0] !== carta) return null;
            // ruling 3: só mágica de criatura com força 4 ou mais; o tempo continua o da carta (lampejo vale)
            if (!isCreature(c.g, carta) || power(c.g, carta) < 4) return null;
            const fonte = c.source;
            return {
              key: `thundermane:${fonte}`, label: 'Thundermane Dragon (do topo do grimório)',
              onUse: (u, magica) => spellGainsUntilEndOfTurn(u.g, p, fonte, magica, [{ k: 'addKeyword', kw: 'haste' }]),
            };
          },
        },
        text: 'Você pode conjurar mágicas de criatura com força 4 ou mais do topo do seu grimório. Se conjurar uma mágica de criatura assim, ela ganha ímpeto até o fim do turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: você pode olhar o topo do seu grimório a qualquer momento; o oponente não',
    2: 'regra geral: CR 401.5 — o topo novo só aparece depois de terminar de conjurar (motor/view.ts topCardView; a visão é refeita a cada decisão)',
    3: 'teste: conjura do topo uma criatura com força 4 ou mais, na fase principal com a pilha vazia, e ela ganha ímpeto até o fim do turno',
  },
});
