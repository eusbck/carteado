// Geothermal Bog
// ({T}: Add {B} or {R}.)
// This land enters tapped.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Geothermal Bog",
  faces: [{ abilities: [
    land.tapped(),
  ] }],
  rulings: {},
});
