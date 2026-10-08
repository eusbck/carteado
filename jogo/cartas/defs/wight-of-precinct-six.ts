// Wight of Precinct Six
// This creature gets +1/+1 for each creature card in your opponents' graveyards.
import { defineCard, isCreature, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Wight of Precinct Six',
  faces: [{
    abilities: [
      // ruling 1: estática comum, só funciona no campo (fora dele é 1/1)
      selfGets((c) => {
        const n = c.g.opponents(c.you).reduce((t, p) => t + c.g.state.zones.graveyard[p].filter((id) => isCreature(c.g, id)).length, 0);
        return n > 0 ? [{ k: 'pt', p: n, t: n }] : [];
      }, 'Esta criatura recebe +1/+1 para cada carta de criatura nos cemitérios dos seus oponentes.'),
    ],
  }],
  rulings: {
    1: 'teste: fora do campo é 1/1',
    2: 'teste: CR 704.3: morre junto com a criatura do oponente, sem crescer a tempo',
  },
});
