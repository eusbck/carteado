// Azorius Chancery
// This land enters tapped.
// When this land enters, return a land you control to its owner's hand.
// {T}: Add {W}{U}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Azorius Chancery",
  faces: [{ abilities: [
    land.tapped(),
    land.bounceLand(),
    mana('WU'),
  ] }],
  rulings: {
    1: "teste: sem outro terreno, devolve a si mesmo para a mão",
  },
});
