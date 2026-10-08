// Quintorius, Field Historian
// Spirits you control get +1/+0.
// Whenever one or more cards leave your graveyard, create a 3/2 red and white Spirit creature token.
import { createTokens, defineCard, isCreature, isSubtype, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Quintorius, Field Historian',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && o.controller === c.you && isCreature(c.g, o.id) && isSubtype(c.g, o.id, 'Spirit'),
        mods: () => [{ k: 'pt', p: 1, t: 0 }],
        text: 'Os Spirits que você controla recebem +1/+0.',
      }),
      // ruling 1: um evento, um gatilho
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you)), function* (c) {
        yield* createTokens(c.g, c.you, 'Spirit 3/2', 1);
      }, { text: 'Sempre que uma ou mais cartas saem do seu cemitério, crie uma ficha de criatura Spirit vermelha e branca 3/2.' }),
    ],
  }],
  rulings: { 1: 'teste: várias cartas de uma vez criam uma ficha só' },
});
