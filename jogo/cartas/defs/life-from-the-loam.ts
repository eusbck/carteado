// Life from the Loam
// Return up to three target land cards from your graveyard to your hand.
// Dredge 3 (If you would draw a card, you may mill three cards instead. If you do, return this card from your graveyard
// to your hand.)
import { defineCard, dredge, is, moveObjects, t, tgtsAll, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Life from the Loam',
  faces: [{
    // CR 702.52 (motor/dragar.ts)
    abilities: [dredge(3)],
    spell: {
      targets: [upTo(3, t.card('graveyard', is.land, 'até três cartas de terreno alvo do seu cemitério', 'you'))],
      *effect(c) {
        // CR 608.2b: só as que continuam alvos legais (ainda no seu cemitério)
        const ids = tgtsAll(c).filter((id) => c.g.state.objects[id]?.zone === 'graveyard');
        if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'hand' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: dragar substitui qualquer compra, não só a da etapa de compra',
    2: 'regra geral: CR 121.1 — pôr na mão sem "comprar" não é compra (motor/actions.ts draw é o único caminho do gancho)',
    3: 'teste: com duas cartas com dragar, uma compra só é substituída por uma delas',
    4: 'teste: com menos de três cartas no grimório, não dá para dragar',
    5: 'regra geral: CR 614.1a — a substituição acontece dentro da compra, sem prioridade no meio (motor/actions.ts draw)',
    6: 'teste: comprando duas, cada compra é perguntada à parte e a carta dragada pode dragar de novo',
  },
});
