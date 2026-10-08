// Gruul Turf
// This land enters tapped.
// When this land enters, return a land you control to its owner's hand.
// {T}: Add {R}{G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Gruul Turf",
  faces: [{ abilities: [
    land.tapped(),
    land.bounceLand(),
    mana('RG'),
  ] }],
  rulings: {
    1: "regra geral: a escolha inclui o próprio terreno (land.bounceLand lista todos os seus terrenos)",
  },
});
