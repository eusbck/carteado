// Haunted Mire
// ({T}: Add {B} or {G}.)
// This land enters tapped.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Haunted Mire",
  faces: [{ abilities: [
    land.tapped(),
  ] }],
});
