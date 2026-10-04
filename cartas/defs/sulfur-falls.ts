// Sulfur Falls
// This land enters tapped unless you control an Island or a Mountain.
// {T}: Add {U} or {R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Sulfur Falls",
  faces: [{ abilities: [
    land.tappedUnlessControl('Island', 'Mountain'),
    mana(['U', 'R']),
  ] }],
  rulings: {},
});
