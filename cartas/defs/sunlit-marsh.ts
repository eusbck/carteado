// Sunlit Marsh
// ({T}: Add {W} or {B}.)
// This land enters tapped.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Sunlit Marsh",
  faces: [{ abilities: [
    land.tapped(),
  ] }],
});
