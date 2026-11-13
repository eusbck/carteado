// Ingenious Infiltrator
// Ninjutsu {U}{B} ({U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// Whenever a Ninja you control deals combat damage to a player, draw a card.
import { defineCard, draw, ninjutsu, triggered } from '../../motor/api.ts';
import { ehNinja, NINJUTSU, suaCausaDanoDeCombate } from '../ninjas.ts';

export default defineCard({
  name: 'Ingenious Infiltrator',
  faces: [{
    abilities: [
      ninjutsu('{U}{B}'),
      // um gatilho por Ninja e por jogador (CR 510.3a)
      triggered(suaCausaDanoDeCombate(ehNinja), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um Ninja que você controla causa dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.10a, 510.2 — o dano é simultâneo; o gatilho é visto antes das ações baseadas em estado (motor/triggers.ts)',
    2: NINJUTSU.depoisDosBloqueios,
    3: NINJUTSU.revela,
    4: NINJUTSU.mesmoJogador,
    5: NINJUTSU.naoDeclarada,
    6: NINJUTSU.etapas,
    7: NINJUTSU.primeiroGolpe,
  },
});
