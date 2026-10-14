// Sunblast Angel
// Flying
// When this creature enters, destroy all tapped creatures.
import { allCreatures, defineCard, destroy, etb, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Sunblast Angel',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: as viradas na resolução, inclusive as suas e ela mesma
      etb(function* (c) {
        yield* destroy(c.g, allCreatures(c.g).filter((id) => c.g.state.objects[id].tapped));
      }, { text: 'Quando esta criatura entra, destrua todas as criaturas viradas.' }),
    ],
  }],
  rulings: { 1: 'teste: destrói as criaturas viradas na resolução, inclusive as suas' },
});
