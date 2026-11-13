// Moonblade Shinobi
// Ninjutsu {2}{U} ({2}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// Whenever this creature deals combat damage to a player, create a 1/1 blue Illusion creature token with flying.
import { createTokens, defineCard, ninjutsu, on, triggered } from '../../motor/api.ts';
import { NINJUTSU } from '../ninjas.ts';

export default defineCard({
  name: 'Moonblade Shinobi',
  faces: [{
    abilities: [
      ninjutsu('{2}{U}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        yield* createTokens(c.g, c.you, 'Illusion 1/1', 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha de criatura Illusion 1/1 azul com voar.' }),
    ],
  }],
  rulings: {
    1: NINJUTSU.depoisDosBloqueios,
    2: NINJUTSU.revela,
    3: NINJUTSU.mesmoJogador,
    4: NINJUTSU.naoDeclarada,
    5: NINJUTSU.etapas,
    6: NINJUTSU.primeiroGolpe,
  },
});
