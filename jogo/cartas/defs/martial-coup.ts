// Martial Coup
// Create X 1/1 white Soldier creature tokens. If X is 5 or more, destroy all other creatures.
import { allCreatures, createTokens, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Martial Coup',
  faces: [{
    spell: {
      *effect(c) {
        // rulings 1-2: tudo na mesma resolução, na ordem do texto (CR 608.2c)
        const soldados = yield* createTokens(c.g, c.you, 'Soldier', c.x);
        // ruling 3: vale o X escolhido ao conjurar, não a mana gasta (CR 107.3a)
        if (c.x >= 5) yield* destroy(c.g, allCreatures(c.g).filter((id) => !soldados.includes(id)));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2c — fichas e destruição acontecem na mesma resolução, sem prioridade no meio',
    2: 'teste: com X = 5, cria os Soldiers e destrói todas as outras criaturas',
    3: 'regra geral: CR 107.3a — o efeito usa o X escolhido ao conjurar (c.x), não a mana gasta',
  },
});
