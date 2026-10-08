// Radiant Grove
// ({T}: Add {G} or {W}.)
// This land enters tapped.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Radiant Grove",
  faces: [{ abilities: [
    land.tapped(),
  ] }],
  rulings: {},
});
