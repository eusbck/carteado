// Reassembling Skeleton
// {1}{B}: Return this card from your graveyard to the battlefield tapped.
import { activated, defineCard, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Reassembling Skeleton',
  faces: [{
    abilities: [
      activated('{1}{B}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you, tapped: true }], 'effect');
      }, { zones: ['graveyard'], text: '{1}{B}: Devolva esta carta do seu cemitério para o campo de batalha virada.' }),
    ],
  }],
  rulings: {},
});
