// Coastal Peak
// ({T}: Add {U} or {R}.)
// This land enters tapped.
// Cycling {2} ({2}, Discard this card: Draw a card.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { cycling, defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Coastal Peak",
  faces: [{ abilities: [
    land.tapped(),
    cycling('{2}'),
  ] }],
});
