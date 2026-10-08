// Teacher's Pest
// Menace
// Whenever this creature attacks, you gain 1 life.
// {B}{G}: Return this card from your graveyard to the battlefield tapped.
import { activated, defineCard, gainLife, keyword, on, putOntoBattlefield, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Teacher's Pest",
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(on.selfAttacks(), function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Sempre que esta criatura ataca, você ganha 1 de vida.' }),
      activated('{B}{G}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you, tapped: true }], 'effect');
      }, { zones: ['graveyard'], text: '{B}{G}: Devolva esta carta do seu cemitério ao campo virada.' }),
    ],
  }],
});
