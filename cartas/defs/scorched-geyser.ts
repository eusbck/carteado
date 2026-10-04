// Scorched Geyser
// ({T}: Add {U} or {R}.)
// This land enters tapped unless you control two or more basic lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Scorched Geyser",
  faces: [{ abilities: [
    land.tappedUnlessBasics(2),
  ] }],
});
