// Canopy Vista
// ({T}: Add {G} or {W}.)
// This land enters tapped unless you control two or more basic lands.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land } from '../../motor/api.ts';

export default defineCard({
  name: "Canopy Vista",
  faces: [{ abilities: [
    land.tappedUnlessBasics(2),
  ] }],
  rulings: {
    1: "regra geral: CR 614.12 — a condição é checada antes de qualquer terreno entrar junto (putOntoBattlefield avalia as substituições antes de mover)",
    2: "regra geral: CR 305.8 — só terrenos com o supertipo básico contam (land.tappedUnlessBasics filtra por supertypes)",
    3: "regra geral: CR 305.6 e 305.8 — tem os tipos básicos sem ser básico (gerado/cartas.json; filtros por tipo e por \"basic\" são separados)",
  },
});
