// Boros Garrison
// This land enters tapped.
// When this land enters, return a land you control to its owner's hand.
// {T}: Add {R}{W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Boros Garrison",
  faces: [{ abilities: [
    land.tapped(),
    land.bounceLand(),
    mana('RW'),
  ] }],
  rulings: {
    1: "teste: sem outro terreno, devolve a si mesmo para a mão",
  },
});
