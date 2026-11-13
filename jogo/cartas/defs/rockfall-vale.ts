// Rockfall Vale
// This land enters tapped unless you control two or more other lands.
// {T}: Add {R} or {G}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Rockfall Vale",
  faces: [{ abilities: [
    land.tappedUnlessOtherLands(2),
    mana(['R', 'G']),
  ] }],
  rulings: {
    1: "teste: entra virado com só um outro terreno — CR 614.12: a condição é checada antes de qualquer terreno entrar junto (putOntoBattlefield avalia as substituições antes de mover)",
  },
});
