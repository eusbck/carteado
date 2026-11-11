// Elena, Turk Recruit
// When Elena enters, return target non-Assassin historic card from your graveyard to your hand. (Artifacts,
// legendaries, and Sagas are historic.)
// Whenever you cast a historic spell, put a +1/+1 counter on Elena.
import { addCounters, chars, defineCard, etb, moveObjects, on, t, tgt, triggered } from '../../motor/api.ts';
import { ehHistorica } from '../jin.ts';

export default defineCard({
  name: 'Elena, Turk Recruit',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => ehHistorica(c.g, id) && !chars(c.g, id).subtypes.includes('Assassin'), 'carta histórica que não seja Assassin alvo do seu cemitério', 'you')],
        text: 'Quando Elena entra, devolva a carta histórica que não seja Assassin alvo do seu cemitério para a sua mão.',
      }),
      // CR 700.6: histórica = artefato, lendária ou Saga
      triggered(on.youCast((c, id) => ehHistorica(c.g, id)), function* (c) {
        addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você conjura uma mágica histórica, coloque um marcador +1/+1 em Elena.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3 — o gatilho de conjurar resolve antes da mágica, mesmo se ela for anulada (motor/stack.ts)',
    2: 'teste: mágica histórica (artefato) dá marcador; não histórica não',
    3: 'regra geral: CR 305.1 — terrenos são jogados, não conjurados (motor/priority.ts)',
    4: 'regra geral: CR 601.2 — só conjurar dispara; pôr no campo sem conjurar não (motor/events)',
  },
});
