// Lychguard
// Guardian Protocols — {3}{B}, Sacrifice this creature: Return all legendary creature cards from your graveyard to your
// hand.
import { activated, chars, defineCard, moveObjects } from '../../motor/api.ts';

export default defineCard({
  name: 'Lychguard',
  faces: [{
    abilities: [
      activated('{3}{B}, Sacrifice this creature', function* (c) {
        const ids = c.g.state.zones.graveyard[c.you].filter((id) => { const ch = chars(c.g, id); return ch.types.includes('Creature') && ch.supertypes.includes('Legendary'); });
        if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'hand' as const })), 'effect');
      }, { text: 'Guardian Protocols — {3}{B}, Sacrifique esta criatura: Devolva todas as cartas de criatura lendária do seu cemitério para a sua mão.' }),
    ],
  }],
  rulings: {},
});