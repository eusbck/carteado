// Eclipsed Steppe
// ({T}: Add {W} or {B}.)
// This land enters tapped unless you control two or more basic lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Eclipsed Steppe",
  faces: [{ abilities: [
    land.tappedUnlessBasics(2),
  ] }],
});
