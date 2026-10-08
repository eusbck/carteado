// Radiant Summit
// ({T}: Add {R} or {W}.)
// This land enters tapped unless you control two or more basic lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Radiant Summit",
  faces: [{ abilities: [
    land.tappedUnlessBasics(2),
  ] }],
  rulings: {
    1: "regra geral: CR 305.8 — tem dois tipos básicos e não é básico; fetchs só acham básicos (isBasicLand)",
  },
});
