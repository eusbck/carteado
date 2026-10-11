// Doom's Time Platform
// Whenever you attack, exile target nonland card from your graveyard with two time counters on it. If it doesn't have
// suspend, it gains suspend. (At the beginning of your upkeep, remove a time counter. When the last is removed, you may
// cast it without paying its mana cost. If it's a creature, it has haste.)
import { addCounters, defineCard, exile, grantSuspend, is, not, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Doom's Time Platform",
  faces: [{
    abilities: [
      triggered(on.youAttack(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const [ex] = yield* exile(c.g, [id]);
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        addCounters(c.g, { kind: 'obj', id: ex }, 'time', 2, c.you);
        // CR 702.62: ganha suspender se ainda não tem
        grantSuspend(c.g, c.source, c.you, [ex]);
      }, { targets: [t.card('graveyard', not(is.land), 'carta que não é terreno alvo no seu cemitério')], text: 'Sempre que você ataca, exile a carta que não é terreno alvo do seu cemitério com dois marcadores de tempo. Se ela não tem suspender, ganha suspender.' }),
    ],
  }],
  rulings: {},
});
