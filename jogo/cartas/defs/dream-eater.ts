// Dream Eater
// Flash
// Flying
// When this creature enters, surveil 4. When you do, you may return target nonland permanent an opponent controls to its
// owner's hand. (To surveil 4, look at the top four cards of your library, then put any number of them into your
// graveyard and the rest on top of your library in any order.)
import { controllerOf, defineAbility, defineCard, etb, keywords, lookAndArrange, reflexive, returnToHand, t, tgt, triggered, upTo } from '../../motor/api.ts';

// CR 603.12: o alvo é escolhido depois de vigiar (ruling 3)
const DEVOLVE = defineAbility('Dream Eater:devolve', triggered({ kind: 'event', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) yield* returnToHand(c.g, [id]);
}, {
  targets: [upTo(1, t.nonlandPermanent((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'até uma permanente não terreno alvo que um oponente controla'))],
  text: 'Quando você fizer isso, você pode devolver a permanente não terreno alvo que um oponente controla para a mão do dono.',
}));

export default defineCard({
  name: 'Dream Eater',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      etb(function* (c) {
        yield* lookAndArrange(c.g, c.you, 4, 'surveil');
        // ruling 4: dispara mesmo com menos de quatro cartas no grimório
        reflexive(c, DEVOLVE.id!);
      }, { text: 'Quando esta criatura entra, vigie 4. Quando fizer isso, você pode devolver a permanente não terreno alvo que um oponente controla para a mão do dono.' }),
    ],
  }],
  rulings: {
    1: 'teste: vigia 4 e depois devolve a permanente do oponente escolhida',
    2: 'regra geral: CR 701.25a — vigiar põe cada carta no topo ou no cemitério (motor/actions.ts lookAndArrange)',
    3: 'teste: vigia 4 e depois devolve a permanente do oponente escolhida',
    4: 'teste: com o grimório vazio, o gatilho reflexivo ainda acontece',
  },
});
