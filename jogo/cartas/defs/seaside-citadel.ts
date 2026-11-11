// Seaside Citadel
// This land enters tapped.
// {T}: Add {G}, {W}, or {U}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Seaside Citadel',
  faces: [{ abilities: [
    land.tapped(),
    mana(['G', 'W', 'U']),
  ] }],
  rulings: {},
});
