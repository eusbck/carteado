// Temple of Plenty
// This land enters tapped.
// When this land enters, scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// {T}: Add {G} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Temple of Plenty",
  faces: [{ abilities: [
    land.tapped(),
    land.scryOnEnter(),
    mana(['G', 'W']),
  ] }],
});
