// Wight of the Reliquary
// Vigilance
// This creature gets +1/+1 for each creature card in your graveyard.
// {T}, Sacrifice another creature: Search your library for a land card, put it onto the battlefield tapped, then
// shuffle.
import { activated, defineCard, isCreature, isLand, keyword, searchTo, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Wight of the Reliquary',
  faces: [{
    abilities: [
      keyword('vigilance'),
      selfGets((c) => {
        const n = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id)).length;
        return [{ k: 'pt', p: n, t: n }];
      }, 'Esta criatura recebe +1/+1 para cada carta de criatura no seu cemitério.'),
      activated('{T}, Sacrifice another creature', function* (c) {
        yield* searchTo(c, c.you, (id) => isLand(c.g, id), 1, 'battlefield', { tapped: true, prompt: 'Procure uma carta de terreno' });
      }, { text: '{T}, Sacrifique outra criatura: Procure uma carta de terreno, coloque-a no campo virada, depois embaralhe.' }),
    ],
  }],
  rulings: {},
});
