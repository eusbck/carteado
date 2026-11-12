// Mist-Syndicate Naga
// Ninjutsu {2}{U} ({2}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// Whenever this creature deals combat damage to a player, create a token that's a copy of this creature.
import { copiableValues, createTokens, defineCard, ninjutsu, on, triggered } from '../../motor/api.ts';
import { NINJUTSU } from '../ninjas.ts';

export default defineCard({
  name: 'Mist-Syndicate Naga',
  faces: [{
    abilities: [
      ninjutsu('{2}{U}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        // CR 707.2: só os valores copiáveis (rulings 1-2); ruling 3: se saiu do campo, usa a última informação conhecida
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha que é uma cópia desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: a ficha é uma cópia sem os marcadores e também tem a habilidade',
    2: 'teste: a ficha é uma cópia sem os marcadores e também tem a habilidade',
    3: 'regra geral: CR 707.2, 608.2h — usa os valores copiáveis da última informação conhecida (motor/mecanicas.ts copiableValues)',
    4: NINJUTSU.depoisDosBloqueios,
    5: NINJUTSU.revela,
    6: NINJUTSU.mesmoJogador,
    7: NINJUTSU.naoDeclarada,
    8: NINJUTSU.etapas,
    9: NINJUTSU.primeiroGolpe,
  },
});
