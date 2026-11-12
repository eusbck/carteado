// Oracle of Mul Daya
// You may play an additional land on each of your turns.
// Play with the top card of your library revealed.
// You may play lands from the top of your library.
import { defineCard, isLand, staticAbility } from '../../motor/api.ts';
import { terrenoAdicional } from '../terras.ts';

export default defineCard({
  name: 'Oracle of Mul Daya',
  faces: [{
    abilities: [
      // ruling 1: soma com os outros efeitos (CR 305.2)
      terrenoAdicional(),
      // o topo revelado: todos o veem (motor/view.ts topOfLibraryRevealed); o dono também
      staticAbility({
        rules: { topOfLibraryRevealed: (c, p) => p === c.you, lookAtTopOfLibrary: (c, p) => p === c.you },
        text: 'Jogue com a carta do topo do seu grimório revelada.',
      }),
      // rulings 2-3: usa as jogadas de terreno do turno, só quando poderia jogar um terreno (motor/priority.ts landPlayOptions)
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => (p === c.you && c.g.state.zones.library[p][0] === carta && isLand(c.g, carta) ? { key: `mul-daya:${c.source}`, label: 'jogar do topo do grimório', land: true } : null),
        },
        text: 'Você pode jogar terrenos do topo do seu grimório.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com duas Oracle of Mul Daya, você joga três terrenos no turno',
    2: 'regra geral: CR 305.2 e 505.6b — o terreno do topo só se joga quando se poderia jogar um terreno (motor/priority.ts landPlayOptions)',
    3: 'teste: jogando o terreno do topo, o novo topo pode ser jogado também',
  },
});
