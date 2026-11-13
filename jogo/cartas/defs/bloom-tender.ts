// Bloom Tender
// Vivid — {T}: For each color among permanents you control, add one mana of that color.
import { defineCard, mana } from '../../motor/api.ts';
import { coresEntrePermanentes } from '../dragoes.ts';

export default defineCard({
  name: 'Bloom Tender',
  faces: [{
    abilities: [
      // rulings 1-5: só as cinco cores dos permanentes (terrenos costumam ser incolores); uma mana de cada cor, nunca incolor
      mana((c) => { const cores = coresEntrePermanentes(c.g, c.you); return cores.length ? [cores] : []; },
        { text: 'Vívido — {T}: Para cada cor entre os permanentes que você controla, adicione uma mana dessa cor.' }),
    ],
  }],
  rulings: {
    1: 'teste: terrenos e artefatos incolores não contam',
    2: 'teste: terrenos e artefatos incolores não contam',
    3: 'teste: um permanente de várias cores conta para cada uma, e no máximo uma mana de cada cor',
    4: 'teste: um permanente de várias cores conta para cada uma, e no máximo uma mana de cada cor',
    5: 'teste: terrenos e artefatos incolores não contam',
  },
});
