// Unwinding Clock
// Untap all artifacts you control during each other player's untap step.
import { controllerOf, defineCard, isType, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Unwinding Clock',
  faces: [{
    abilities: [
      // CR 502.3: desviram junto com as permanentes do jogador ativo, sem escolha (ruling 1)
      staticAbility({
        rules: { untapDuringUntapOf: (c, obj, ativo) => ativo !== c.you && controllerOf(c.g, obj) === c.you && isType(c.g, obj, 'Artifact') },
        text: 'Desvire todos os artefatos que você controla durante a etapa de desvirar de cada outro jogador.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: na etapa de desvirar do oponente, os seus artefatos desviram e as outras permanentes não',
    2: 'não se aplica: nenhuma carta dos decks impede um artefato de desvirar na etapa do controlador',
    3: 'teste: com dois Unwinding Clock, os artefatos desviram uma vez só',
  },
});
