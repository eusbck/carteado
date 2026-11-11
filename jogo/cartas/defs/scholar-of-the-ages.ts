// Scholar of the Ages
// When this creature enters, return up to two target instant and/or sorcery cards from your graveyard to your hand.
import { defineCard, etb, is, returnToHand, t, tgtsAll, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Scholar of the Ages',
  faces: [{
    abilities: [etb(function* (c) {
      const ids = tgtsAll(c);
      if (ids.length) yield* returnToHand(c.g, ids);
    }, {
      // ruling 1: até duas no total, instantâneas e/ou feitiços
      targets: [upTo(2, t.card('graveyard', is.instantOrSorcery, 'carta de instantânea ou feitiço alvo no seu cemitério'))],
      text: 'Quando esta criatura entra, devolva até duas cartas de instantânea e/ou feitiço alvo do seu cemitério para a sua mão.',
    })],
  }],
  rulings: { 1: 'teste: devolve até duas cartas de instantânea e/ou feitiço no total' },
});
