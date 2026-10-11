// Hinterland Harbor
// This land enters tapped unless you control a Forest or an Island.
// {T}: Add {G} or {U}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Hinterland Harbor",
  faces: [{ abilities: [
    land.tappedUnlessControl('Forest', 'Island'),
    mana(['G', 'U']),
  ] }],
  rulings: {},
});
