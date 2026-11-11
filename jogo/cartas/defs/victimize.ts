// Victimize
// Choose two target creature cards in your graveyard. Sacrifice a creature. If you do, return the chosen cards to the
// battlefield tapped.
import { defineCard, exactly, is, isCreature, putOntoBattlefield, sacrificeYours, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Victimize',
  faces: [{
    spell: {
      targets: [exactly(2, t.card('graveyard', is.creature, 'cartas de criatura alvo do seu cemitério'))],
      *effect(c) {
        const alvos = (c.targets[0] ?? []).flatMap((x) => (x && x.kind === 'obj' ? [x.id] : []));
        const [sacr] = yield* sacrificeYours(c, c.you, (id) => isCreature(c.g, id));
        if (sacr === undefined) return;
        const volta = alvos.filter((id) => c.g.state.objects[id]?.zone === 'graveyard');
        if (volta.length) yield* putOntoBattlefield(c.g, volta.map((id) => ({ id, controller: c.you, tapped: true })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — a criatura sacrificada não é um dos alvos já escolhidos',
    2: 'regra geral: CR 608.2b — se um alvo ficou ilegal, o outro volta',
    3: 'regra geral: CR 701.21a — sem criatura para sacrificar, nada volta',
    4: 'regra geral: CR 601.2c — precisa de dois alvos para conjurar',
  },
});
