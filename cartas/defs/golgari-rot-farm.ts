// Golgari Rot Farm
// This land enters tapped.
// When this land enters, return a land you control to its owner's hand.
// {T}: Add {B}{G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Golgari Rot Farm",
  faces: [{ abilities: [
    land.tapped(),
    land.bounceLand(),
    mana('BG'),
  ] }],
});
