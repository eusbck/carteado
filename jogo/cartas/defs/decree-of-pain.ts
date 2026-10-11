// Decree of Pain
// Destroy all creatures. They can't be regenerated. Draw a card for each creature destroyed this way.
// Cycling {3}{B}{B} ({3}{B}{B}, Discard this card: Draw a card.)
// When you cycle this card, all creatures get -2/-2 until end of turn.
import { allCreatures, cycling, defineCard, destroy, draw, lkiObj, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

const ciclagem = cycling('{3}{B}{B}');

export default defineCard({
  name: 'Decree of Pain',
  faces: [{
    abilities: [
      ciclagem,
      // CR 702.29c: "quando você cicla esta carta" dispara da zona em que a carta foi parar; rulings 1-2: o gatilho
      // resolve antes da compra da ciclagem e é independente dela
      triggered(on.custom((e, c) => {
        if (e.type !== 'activate' || e.abilityId !== ciclagem.id) return false;
        const antes = lkiObj(c.g, e.source);
        return !!antes && antes.card !== null && antes.card === c.obj.card;
      }), function* (c) {
        const ids = allCreatures(c.g);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: -2, t: -2 }]);
      }, { zones: ['graveyard', 'exile'], text: 'Quando você cicla esta carta, todas as criaturas recebem -2/-2 até o fim do turno.' }),
    ],
    spell: {
      *effect(c) {
        // CR 701.19c: sem regeneração; conta só as que foram mesmo destruídas (indestrutíveis ficam de fora)
        const res = yield* destroy(c.g, allCreatures(c.g), { cantRegenerate: true });
        const n = res.filter((x) => x !== null).length;
        if (n > 0) yield* draw(c.g, c.you, n);
      },
    },
  }],
  rulings: {
    1: 'teste: ciclando, todas as criaturas recebem -2/-2 antes de você comprar a carta',
    2: 'regra geral: CR 702.29c — o gatilho de ciclar e a habilidade de ciclagem são independentes (motor/dsl.ts cycling)',
  },
});
