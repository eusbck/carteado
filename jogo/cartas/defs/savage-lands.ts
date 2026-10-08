// Savage Lands
// This land enters tapped.
// {T}: Add {B}, {R}, or {G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Savage Lands",
  faces: [{ abilities: [
    land.tapped(),
    mana(['B', 'R', 'G']),
  ] }],
  rulings: {},
});
