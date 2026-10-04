// Turbulent Moor
// ({T}: Add {W} or {B}.)
// This land enters tapped unless your opponents control eight or more lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Turbulent Moor",
  faces: [{ abilities: [
    land.tappedUnlessOpponentsLands(8),
  ] }],
  rulings: {
    1: "regra geral: CR 305.8 — tem dois tipos básicos e não é básico; fetchs só acham básicos (isBasicLand)",
    2: "regra geral: CR 614.12 — a condição é checada antes de qualquer terreno entrar junto (putOntoBattlefield avalia as substituições antes de mover)",
  },
});
