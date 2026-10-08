// Bloodline Bidding
// Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one
// mana of that creature's color.)
// Choose a creature type. Return all creature cards of the chosen type from your graveyard to the battlefield.
import { chars, chooseCreatureType, defineCard, isCreature, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodline Bidding',
  faces: [{
    convoke: true,
    spell: {
      *effect(c) {
        // ruling 2: o tipo é escolhido na resolução
        const tipo = yield* chooseCreatureType(c.g, c.you, 'Bloodline Bidding: escolha um tipo de criatura');
        const cartas = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id) && chars(c.g, id).subtypes.includes(tipo));
        if (cartas.length) yield* putOntoBattlefield(c.g, cartas.map((id) => ({ id, controller: c.you })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'não se aplica: Bloodline Bidding é feitiço, não dá para conjurá-la com criaturas atacando ou bloqueando',
    2: 'teste: o tipo de criatura é escolhido na resolução',
    3: 'teste: criatura já virada (por mana ou outra coisa) não ajuda no convoke',
    4: 'regra geral: CR 702.51a — o convoke vem depois do custo total (motor/stack.ts) e não muda o valor de mana',
    5: 'teste: criatura com enjoo de invocação também ajuda no convoke',
  },
});
