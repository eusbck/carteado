// Elena, Turk Recruit
// When Elena enters, return target non-Assassin historic card from your graveyard to your hand. (Artifacts, legendaries,
// and Sagas are historic.)
// Whenever you cast a historic spell, put a +1/+1 counter on Elena.
import { addCounters, defineCard, etb, isSubtype, on, returnToHand, t, tgt, triggered } from '../../motor/api.ts';
import { ehHistorica } from '../jin.ts';

export default defineCard({
  name: 'Elena, Turk Recruit',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* returnToHand(c.g, [id]);
      }, {
        targets: [t.card('graveyard', (c, id) => ehHistorica(c.g, id) && !isSubtype(c.g, id, 'Assassin'), 'carta histórica que não é Assassin no seu cemitério', 'you')],
        text: 'Quando Elena entrar, devolva a carta histórica alvo que não é Assassin do seu cemitério para a sua mão. (Artefatos, lendárias e Sagas são históricos.)',
      }),
      // CR 700.6: histórica é a mágica lendária, de artefato ou Saga
      triggered(on.youCast((c, id) => ehHistorica(c.g, id)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você conjurar uma mágica histórica, coloque um marcador +1/+1 em Elena.' }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho de conjurar uma mágica histórica resolve antes dela e mesmo que ela seja anulada',
    2: 'teste: conjurar um artefato ou uma mágica lendária põe um marcador; uma mágica comum, não',
    3: 'teste: jogar um terreno lendário não dispara',
    4: 'teste: uma carta histórica posta no campo sem ser conjurada não dispara',
  },
});
