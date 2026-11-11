// Scute Swarm
// Landfall — Whenever a land you control enters, create a 1/1 green Insect creature token. If you control six or more
// lands, create a token that's a copy of this creature instead.
import { controlledBy, copiableValues, createTokens, defineCard, isLand, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Scute Swarm',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        // a contagem é feita na resolução
        if (controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length >= 6) {
          // rulings 4-6: cópia dos valores copiáveis (CR 707.2), também pela última informação se a Scute Swarm saiu
          yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, 1);
        } else {
          yield* createTokens(c.g, c.you, 'Insect verde', 1);
        }
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, crie uma ficha de criatura Insect 1/1 verde. Se você controlar seis ou mais terrenos, em vez disso crie uma ficha que é uma cópia desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: com menos de seis terrenos, cria um Insect 1/1; com seis, uma cópia que também se copia',
    2: 'regra geral: CR 603.6a — permanente que já está no campo e vira terreno não dispara (motor/dsl.ts on.landfall)',
    3: 'regra geral: CR 603.3b — vários gatilhos de aterragem vão para a pilha na ordem que você escolher',
    4: 'teste: com menos de seis terrenos, cria um Insect 1/1; com seis, uma cópia que também se copia',
    5: 'regra geral: CR 707.2 — a cópia não leva marcadores, dano nem efeitos (motor/mecanicas.ts copiableValues)',
    6: 'regra geral: CR 707.2, 608.2h — se a Scute Swarm saiu do campo, copia pela última informação (copiableValues usa a LKI)',
  },
});
