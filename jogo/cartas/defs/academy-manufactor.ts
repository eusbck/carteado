// Academy Manufactor
// If you would create a Clue, Food, or Treasure token, instead create one of each.
import { defineCard, staticAbility } from '../../motor/api.ts';

const TRES = ['Clue', 'Food', 'Treasure'];

export default defineCard({
  name: 'Academy Manufactor',
  faces: [{
    abilities: [
      // CR 614.1a: cada Clue, Food ou Treasure vira uma de cada; com dois Manufactors, cada um se aplica uma vez (ruling 2)
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.some((x) => TRES.includes(x.def ?? '')) ? null : {
            label: 'Academy Manufactor: uma Clue, uma Food e um Treasure',
            *replace(e) { return { ...e, tokens: e.tokens.flatMap((x) => (TRES.includes(x.def ?? '') ? TRES.map((def) => ({ de: x.de, def })) : [x])) }; },
          }),
        },
        text: 'Se você fosse criar uma ficha Clue, Food ou Treasure, em vez disso crie uma de cada.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: criar duas Food cria duas de cada: Clue, Food e Treasure',
    2: 'teste: com dois Manufactors, uma Food vira três de cada',
    3: 'não se aplica: ruling sem efeito de jogo',
    4: 'regra geral: criar a Clue pela substituição não é investigar (motor/criaturas.ts investigate)',
  },
});
