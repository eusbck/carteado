// Temple of Malady
// This land enters tapped.
// When this land enters, scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// {T}: Add {B} or {G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Temple of Malady",
  faces: [{ abilities: [
    land.tapped(),
    land.scryOnEnter(),
    mana(['B', 'G']),
  ] }],
  rulings: {},
});
