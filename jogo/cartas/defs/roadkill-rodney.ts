// Roadkill Rodney
// Squad {3} (As an additional cost to cast this spell, you may pay {3} any number of times. When this creature enters,
// create that many tokens that are copies of it.)
// Deathtouch
// Whenever this creature deals combat damage to a player, create a Mutagen token.
import { createTokens, defineCard, keyword, on, squad, triggered } from '../../motor/api.ts';

const esq = squad('{3}');

export default defineCard({
  name: 'Roadkill Rodney',
  faces: [{
    // CR 702.157a: custo adicional repetível + gatilho de entrar que cria as cópias
    additionalCosts: [esq.cost],
    abilities: [
      esq.trigger,
      keyword('deathtouch'),
      // ruling 2 (CR 111.10v): a ficha predefinida de Mutagen
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        yield* createTokens(c.g, c.you, 'Mutagen', 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha de Mutagen.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 702.157a: com o esquadrão pago duas vezes, cria duas cópias ao entrar',
    2: 'teste: ao causar dano de combate a um jogador, cria uma ficha de Mutagen',
    3: 'regra geral: CR 707.10, 111.1 — as fichas não são conjuradas (motor/conjurar-alternativo.ts squad)',
    4: 'regra geral: CR 702.157a — se sair antes de o gatilho resolver, as cópias são criadas pela última informação (cartas/defs/endless-foot-assault.test.ts)',
    5: 'não se aplica: o gatilho que cria a ficha de Mutagen não tem alvos',
    6: 'regra geral: CR 702.157a — anulada, o gatilho não dispara (cartas/defs/endless-foot-assault.test.ts)',
    7: 'regra geral: CR 702.157a — o gatilho é a habilidade de esquadrão do permanente (motor/conjurar-alternativo.ts squad)',
  },
});
