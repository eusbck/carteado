// Fleet Captain Christopher Pike
// Yes — {1}, {T}: Untap two other target creatures.
// No — {2}, {T}: Tap two other target creatures.
import { activated, defineCard, exactly, tap, t, tgtsAll, untap } from '../../motor/api.ts';

// "Yes" e "No" são palavras de habilidade (CR 207.2c), sem efeito nas regras
const outra = (label: string) => exactly(2, t.creature((c, id) => id !== c.source, label));

export default defineCard({
  name: 'Fleet Captain Christopher Pike',
  faces: [{
    abilities: [
      activated('{1}, {T}', function* (c) {
        for (const id of tgtsAll(c, 0)) untap(c.g, id);
      }, { targets: [outra('duas outras criaturas alvo (desvirar)')], text: 'Yes — {1}, {T}: Desvire duas outras criaturas alvo.' }),
      activated('{2}, {T}', function* (c) {
        for (const id of tgtsAll(c, 0)) tap(c.g, id);
      }, { targets: [outra('duas outras criaturas alvo (virar)')], text: 'No — {2}, {T}: Vire duas outras criaturas alvo.' }),
    ],
  }],
  rulings: {},
});
