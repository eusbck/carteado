// Verge Rangers
// First strike
// You may look at the top card of your library any time.
// As long as an opponent controls more lands than you, you may play lands from the top of your library. (You can play a
// land this way only if you have an available land play remaining.)
import { defineCard, isLand, keyword, staticAbility } from '../../motor/api.ts';
import { oponenteComMaisTerrenos } from '../esquisitos.ts';

export default defineCard({
  name: 'Verge Rangers',
  faces: [{
    abilities: [
      keyword('first strike'),
      // ruling 2: olhar o topo não usa a pilha
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          // ruling 1: usa a jogada de terreno do turno (motor/priority.ts landPlayOptions)
          mayPlayFrom: (c, p, carta) => {
            if (p !== c.you || c.g.state.zones.library[p][0] !== carta || !isLand(c.g, carta) || !oponenteComMaisTerrenos(c.g, p)) return null;
            return { key: `verge-rangers:${c.source}`, label: 'jogar do topo do grimório', land: true };
          },
        },
        text: 'Enquanto um oponente controlar mais terrenos que você, você pode jogar terrenos do topo do seu grimório.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: jogar o terreno do topo usa a jogada de terreno do turno',
    2: 'regra geral: o gancho lookAtTopOfLibrary mostra a carta do topo ao controlador o tempo todo, sem usar a pilha (motor/view.ts)',
    3: 'regra geral: a carta nova do topo só é mostrada depois que a ação termina (o cliente lê o estado depois de cada ação)',
  },
});
