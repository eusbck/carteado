// Temple of Epiphany
// This land enters tapped.
// When this land enters, scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// {T}: Add {U} or {R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Temple of Epiphany",
  faces: [{ abilities: [
    land.tapped(),
    land.scryOnEnter(),
    mana(['U', 'R']),
  ] }],
});
