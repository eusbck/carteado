// Woodland Cemetery
// This land enters tapped unless you control a Swamp or a Forest.
// {T}: Add {B} or {G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Woodland Cemetery",
  faces: [{ abilities: [
    land.tappedUnlessControl('Swamp', 'Forest'),
    mana(['B', 'G']),
  ] }],
});
