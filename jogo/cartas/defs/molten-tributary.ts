// Molten Tributary
// ({T}: Add {U} or {R}.)
// This land enters tapped.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Molten Tributary",
  faces: [{ abilities: [
    land.tapped(),
  ] }],
  rulings: {},
});
