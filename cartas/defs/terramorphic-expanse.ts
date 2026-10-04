// Terramorphic Expanse
// {T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Terramorphic Expanse",
  faces: [{ abilities: [
    land.fetchBasic(),
  ] }],
  rulings: {},
});
