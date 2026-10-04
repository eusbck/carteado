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
});
