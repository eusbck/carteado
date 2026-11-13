// Lotus Cobra
// Landfall — Whenever a land you control enters, add one mana of any color.
import { addMana, chooseColor, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Lotus Cobra',
  faces: [{
    abilities: [
      // rulings 7-8: não é habilidade de mana (o evento não é uma habilidade de mana): usa a pilha (CR 605.1b)
      triggered(on.landfall(), function* (c) {
        const cor = yield* chooseColor(c.g, c.you, 'Lotus Cobra: escolha a cor da mana');
        addMana(c.g, c.you, [cor]);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3b — vários gatilhos de aterragem vão para a pilha na ordem que você escolher',
    2: 'teste: jogando um terreno, o gatilho vai para a pilha e dá uma mana da cor escolhida',
    3: 'regra geral: CR 603.6a — permanente que já está no campo e vira terreno não dispara (motor/dsl.ts on.landfall)',
    4: 'teste: jogando um terreno, o gatilho vai para a pilha e dá uma mana da cor escolhida',
    5: 'regra geral: CR 603.6a — permanente que já está no campo e vira terreno não dispara (motor/dsl.ts on.landfall)',
    6: 'regra geral: CR 603.3b — vários gatilhos de aterragem vão para a pilha na ordem que você escolher',
    7: 'teste: jogando um terreno, o gatilho vai para a pilha e dá uma mana da cor escolhida',
    8: 'teste: jogando um terreno, o gatilho vai para a pilha e dá uma mana da cor escolhida',
  },
});
