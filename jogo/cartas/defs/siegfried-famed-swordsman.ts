// Siegfried, Famed Swordsman
// Menace
// When Siegfried enters, mill three cards. Then put X +1/+1 counters on Siegfried, where X is twice the number of
// creature cards in your graveyard.
import { addCounters, defineCard, etb, isCreature, keyword, mill } from '../../motor/api.ts';

export default defineCard({
  name: 'Siegfried, Famed Swordsman',
  faces: [{
    abilities: [
      keyword('menace'),
      etb(function* (c) {
        yield* mill(c.g, c.you, 3);
        // ruling 1: X calculado uma vez, na resolução
        const x = 2 * c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id)).length;
        if (x > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', x, c.you);
      }, { text: 'Quando Siegfried entra, moa três cartas. Depois, coloque X marcadores +1/+1 em Siegfried, onde X é o dobro do número de cartas de criatura no seu cemitério.' }),
    ],
  }],
  rulings: { 1: 'teste: conta as criaturas no cemitério depois de moer' },
});
