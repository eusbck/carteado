// Defy Death
// Return target creature card from your graveyard to the battlefield. If it's an Angel, put two +1/+1 counters on it.
import { addCounters, defineCard, is, isSubtype, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Defy Death',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.creature, 'carta de criatura alvo do seu cemitério')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const [novo] = yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        // rulings 1-2: confere logo depois, já no campo
        if (novo !== undefined && c.g.state.objects[novo]?.zone === 'battlefield' && isSubtype(c.g, novo, 'Angel')) addCounters(c.g, { kind: 'obj', id: novo }, '+1/+1', 2, c.you);
      },
    },
  }],
  rulings: {
    1: 'teste: devolve um Angel com dois marcadores +1/+1; outra criatura sem marcadores',
    2: 'regra geral: CR 608.2c — confere se é Angel como permanente, já no campo',
  },
});
