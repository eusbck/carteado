// Victimize
// Choose two target creature cards in your graveyard. Sacrifice a creature. If you do, return the chosen cards to the
// battlefield tapped.
import { defineCard, eachSacrifices, exactly, is, isCreature, putOntoBattlefield, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: 'Victimize',
  faces: [{
    spell: {
      // ruling 1: exatamente dois alvos
      targets: [exactly(2, t.card('graveyard', is.creature, 'duas cartas de criatura alvo do seu cemitério'))],
      *effect(c) {
        // ruling 2: com um alvo ilegal, ainda sacrifica e devolve o outro (com os dois ilegais, nem resolve: CR 608.2b)
        const cartas = tgtsAll(c, 0);
        // rulings 3-4: a criatura é escolhida na resolução, e é obrigatório se puder
        const sac = yield* eachSacrifices(c, [c.you], (id) => isCreature(c.g, id), 1, 'uma criatura');
        if (!sac.length) return;
        const ainda = cartas.filter((id) => c.g.state.objects[id]?.zone === 'graveyard');
        if (ainda.length) yield* putOntoBattlefield(c.g, ainda.map((id) => ({ id, controller: c.you, tapped: true })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: sacrifica uma criatura e devolve as duas cartas viradas',
    2: 'teste: com um alvo que saiu do cemitério, ainda sacrifica e devolve o outro',
    3: 'teste: sacrifica uma criatura e devolve as duas cartas viradas',
    4: 'teste: sem criatura para sacrificar, nada volta',
  },
});
