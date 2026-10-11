// Rekindling Phoenix
// Flying
// When this creature dies, create a 0/1 red Elemental creature token with "At the beginning of your upkeep, sacrifice
// this token and return target card named Rekindling Phoenix from your graveyard to the battlefield. It gains haste
// until end of turn."
import { createTokens, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Rekindling Phoenix',
  faces: [{
    abilities: [
      keyword('flying'),
      // a habilidade da ficha fica em cartas/fichas.ts ('Elemental 0/1')
      triggered(on.selfDies(), function* (c) {
        yield* createTokens(c.g, c.you, 'Elemental 0/1', 1);
      }, { text: 'Quando esta criatura morre, crie uma ficha de criatura Elemental 0/1 vermelha com "No início da sua manutenção, sacrifique esta ficha e devolva a carta com o nome Rekindling Phoenix alvo do seu cemitério para o campo de batalha. Ela ganha ímpeto até o fim do turno."' }),
    ],
  }],
  rulings: {
    1: 'teste: sem Rekindling Phoenix no cemitério, a ficha não é sacrificada e tenta de novo na manutenção seguinte',
    2: 'regra geral: CR 201.2 — a ficha procura uma carta com o nome Rekindling Phoenix (cartas/fichas.ts)',
  },
});
