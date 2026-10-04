// Turbulent Fen
// ({T}: Add {B} or {G}.)
// This land enters tapped unless your opponents control eight or more lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Turbulent Fen",
  faces: [{ abilities: [
    land.tappedUnlessOpponentsLands(8),
  ] }],
});
