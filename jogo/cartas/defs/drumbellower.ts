// Drumbellower
// Flying
// Untap all creatures you control during each other player's untap step.
import { controllerOf, defineCard, isCreature, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Drumbellower',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 502.3: desvira junto com o jogador ativo; não há escolha (ruling 2)
      staticAbility({
        rules: { untapDuringUntapOf: (c, obj, ativo) => ativo !== c.you && controllerOf(c.g, obj) === c.you && isCreature(c.g, obj) },
        text: 'Desvire todas as criaturas que você controla durante a etapa de desvirar de cada outro jogador.',
      }),
    ],
  }],
  rulings: {
    1: 'não se aplica: nenhuma carta dos decks impede desvirar',
    2: 'teste: desvira todas as suas criaturas na etapa de desvirar dos outros',
  },
});
