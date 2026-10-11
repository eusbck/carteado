// Selesnya Sanctuary
// This land enters tapped.
// When this land enters, return a land you control to its owner's hand.
// {T}: Add {G}{W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Selesnya Sanctuary",
  faces: [{ abilities: [
    land.tapped(),
    land.bounceLand(),
    mana('GW'),
  ] }],
  rulings: {
    1: "teste: sem outro terreno, devolve a si mesmo para a mão",
  },
});
