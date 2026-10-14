// Deep Forest Hermit
// Vanishing 3 (This creature enters with three time counters on it. At the beginning of your upkeep, remove a time
// counter from it. When the last is removed, sacrifice it.)
// When this creature enters, create four 1/1 green Squirrel creature tokens.
// Squirrels you control get +1/+1.
import { anthem, and, createTokens, defineCard, etb, is } from '../../motor/api.ts';
import { vanishing } from '../esquilos.ts';

export default defineCard({
  name: 'Deep Forest Hermit',
  faces: [{
    abilities: [
      ...vanishing(3),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Squirrel', 4); }, { text: 'Quando esta criatura entra, crie quatro fichas de criatura Squirrel verdes 1/1.' }),
      anthem(and(is.creature, is.subtype('Squirrel'), is.yours), () => [{ k: 'pt', p: 1, t: 1 }], 'Os Squirrels que você controla recebem +1/+1.'),
    ],
  }],
  rulings: {},
});
