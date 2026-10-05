// Jadar, Ghoulcaller of Nephalia
// At the beginning of your end step, if you control no creatures with decayed, create a 2/2 black Zombie creature token
// with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)
import { controlledBy, createTokens, defineCard, hasKw, isCreature, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Jadar, Ghoulcaller of Nephalia',
  faces: [{
    abilities: [triggered(on.endStep('you'), function* (c) {
      yield* createTokens(c.g, c.you, 'Zombie', 1);
    }, {
      condition: (c) => controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && hasKw(c.g, id, 'decayed')).length === 0,
      text: 'No início da sua etapa final, se você não controla criaturas com decaimento, crie uma ficha de criatura Zombie preta 2/2 com decaimento.',
    })],
  }],
  rulings: {
    1: 'regra geral: CR 702.147a — decaimento não obriga a atacar',
    2: 'regra geral: CR 702.147a — o gatilho de sacrifício já disparou',
    3: 'teste: a ficha não pode bloquear',
    4: 'regra geral: CR 302.6 — sem ímpeto, enjoo de invocação normal',
  },
});
