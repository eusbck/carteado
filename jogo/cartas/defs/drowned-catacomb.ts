// Drowned Catacomb
// This land enters tapped unless you control an Island or a Swamp.
// {T}: Add {U} or {B}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Drowned Catacomb',
  faces: [{ abilities: [
    // CR 614.12: a condição é vista antes de entrar, só com os terrenos que já estão no campo
    land.tappedUnlessControl('Island', 'Swamp'),
    mana(['U', 'B']),
  ] }],
  rulings: {
    1: 'teste: CR 614.12: não vê terrenos que entram ao mesmo tempo',
    2: 'teste: CR 305.8: conta o tipo de terreno, inclusive de terreno não básico',
  },
});
