// Liliana's Mastery
// Zombies you control get +1/+1.
// When this enchantment enters, create two 2/2 black Zombie creature tokens.
import { anthem, controllerOf, createTokens, defineCard, etb, isCreature, isSubtype } from '../../motor/api.ts';

export default defineCard({
  name: "Liliana's Mastery",
  faces: [{
    abilities: [
      anthem((c, id) => isCreature(c.g, id) && isSubtype(c.g, id, 'Zombie') && controllerOf(c.g, id) === c.you,
        () => [{ k: 'pt', p: 1, t: 1 }], 'Os Zombies que você controla recebem +1/+1.'),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Zombie 2/2', 2); }, { text: 'Quando este encantamento entra, crie duas fichas de criatura Zombie pretas 2/2.' }),
    ],
  }],
  rulings: {},
});
