// Cinder Glade
// ({T}: Add {R} or {G}.)
// This land enters tapped unless you control two or more basic lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Cinder Glade",
  faces: [{ abilities: [
    land.tappedUnlessBasics(2),
  ] }],
});
