// Dragonskull Summit
// This land enters tapped unless you control a Swamp or a Mountain.
// {T}: Add {B} or {R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Dragonskull Summit",
  faces: [{ abilities: [
    land.tappedUnlessControl('Swamp', 'Mountain'),
    mana(['B', 'R']),
  ] }],
});
