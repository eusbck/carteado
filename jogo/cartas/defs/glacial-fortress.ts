// Glacial Fortress
// This land enters tapped unless you control a Plains or an Island.
// {T}: Add {W} or {U}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Glacial Fortress',
  faces: [{ abilities: [
    // CR 614.12: a condição é vista antes de entrar, só com os terrenos que já estão no campo
    land.tappedUnlessControl('Plains', 'Island'),
    mana(['W', 'U']),
  ] }],
  rulings: {
    1: 'teste: CR 614.12: não vê terrenos que entram ao mesmo tempo',
    2: 'teste: CR 305.8: conta o tipo de terreno, inclusive de terreno não básico',
  },
});
