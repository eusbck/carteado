// Shipwreck Marsh
// This land enters tapped unless you control two or more other lands.
// {T}: Add {U} or {B}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Shipwreck Marsh',
  faces: [{ abilities: [land.tappedUnlessOtherLands(2), mana(['U', 'B'])] }],
  rulings: { 1: 'regra geral: CR 614.1c — confere os outros terrenos no momento em que entra (motor/dsl.ts land.tappedUnlessOtherLands)' },
});
