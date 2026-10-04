// Sacred Peaks
// ({T}: Add {R} or {W}.)
// This land enters tapped.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Sacred Peaks",
  faces: [{ abilities: [
    land.tapped(),
  ] }],
  rulings: {},
});
