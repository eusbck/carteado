// Jungle Shrine
// This land enters tapped.
// {T}: Add {R}, {G}, or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Jungle Shrine",
  faces: [{ abilities: [
    land.tapped(),
    mana(['R', 'G', 'W']),
  ] }],
  rulings: {},
});
