// Vampire Nighthawk
// Flying
// Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)
// Lifelink (Damage dealt by this creature also causes you to gain that much life.)
import { defineCard, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Vampire Nighthawk',
  faces: [{ abilities: keywords('flying', 'deathtouch', 'lifelink') }],
  rulings: {},
});
