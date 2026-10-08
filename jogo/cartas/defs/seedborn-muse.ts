// Seedborn Muse
// Untap all permanents you control during each other player's untap step.
import { controllerOf, defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Seedborn Muse',
  faces: [{
    abilities: [staticAbility({
      // CR 502.3: desvira junto com o jogador ativo; não há escolha (ruling 2)
      rules: { untapDuringUntapOf: (c, obj, ativo) => ativo !== c.you && controllerOf(c.g, obj) === c.you },
      text: 'Desvire todos os permanentes que você controla durante a etapa de desvirar de cada outro jogador.',
    })],
  }],
  rulings: {
    1: 'não se aplica: nenhuma carta dos decks impede desvirar',
    2: 'teste: desvira todos os seus permanentes na etapa de desvirar dos outros',
  },
});
