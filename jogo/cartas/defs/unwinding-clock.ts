// Unwinding Clock
// Untap all artifacts you control during each other player's untap step.
import { controllerOf, defineCard, isType, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Unwinding Clock',
  faces: [{
    abilities: [staticAbility({
      // CR 502.3: desvira junto com o jogador ativo
      rules: { untapDuringUntapOf: (c, obj, ativo) => ativo !== c.you && controllerOf(c.g, obj) === c.you && isType(c.g, obj, 'Artifact') },
      text: 'Desvire todos os artefatos que você controla durante a etapa de desvirar de cada outro jogador.',
    })],
  }],
  rulings: {
    1: 'regra geral: CR 502.3 — não há escolha: todos desviram',
    2: 'regra geral: CR 502.4 — ninguém recebe prioridade na etapa de desvirar',
    3: 'regra geral: CR 502.3 — efeitos que impedem desvirar continuam valendo',
  },
});
