// Umbral Expanse
// ({T}: Add {W} or {B}.)
// This land enters tapped.
// Cycling {2} ({2}, Discard this card: Draw a card.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { cycling, defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Umbral Expanse",
  faces: [{ abilities: [
    land.tapped(),
    cycling('{2}'),
  ] }],
  rulings: {
    1: "regra geral: CR 305.8 — tem dois tipos básicos e não é básico; fetchs só acham básicos (isBasicLand)",
  },
});
