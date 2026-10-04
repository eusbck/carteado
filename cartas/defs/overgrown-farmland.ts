// Overgrown Farmland
// This land enters tapped unless you control two or more other lands.
// {T}: Add {G} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Overgrown Farmland",
  faces: [{ abilities: [
    land.tappedUnlessOtherLands(2),
    mana(['G', 'W']),
  ] }],
});
