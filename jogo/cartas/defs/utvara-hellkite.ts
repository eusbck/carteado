// Utvara Hellkite
// Flying
// Whenever a Dragon you control attacks, create a 6/6 red Dragon creature token with flying.
import { controllerOf, createTokens, defineCard, isSubtype, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Utvara Hellkite',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 603.2c: dispara uma vez para cada Dragon seu que ataca
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => c.g.state.objects[a.obj] && isSubtype(c.g, a.obj, 'Dragon') && controllerOf(c.g, a.obj) === c.you).map((a) => ({ dragao: a.obj }))
        : false)), function* (c) {
        yield* createTokens(c.g, c.you, 'Dragon 6/6', 1);
      }, { text: 'Sempre que um Dragon que você controla ataca, crie uma ficha de criatura Dragon vermelha 6/6 com voar.' }),
    ],
  }],
  rulings: {},
});
