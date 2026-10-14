// Opulent Palace
// This land enters tapped.
// {T}: Add {B}, {G}, or {U}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Opulent Palace",
  faces: [{ abilities: [
    land.tapped(),
    mana(['B', 'G', 'U']),
  ] }],
  rulings: {},
});
