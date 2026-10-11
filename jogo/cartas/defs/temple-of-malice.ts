// Temple of Malice
// This land enters tapped.
// When this land enters, scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// {T}: Add {B} or {R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Temple of Malice",
  faces: [{ abilities: [
    land.tapped(),
    land.scryOnEnter(),
    mana(['B', 'R']),
  ] }],
  rulings: {
    1: "regra geral: CR 701.22a — cada carta vai para o topo ou o fundo à escolha (lookAndArrange)",
    2: "regra geral: CR 701.22a — a decisão de vidência ordena o topo e o fundo (lookAndArrange)",
    3: "regra geral: CR 608.2c — instruções em ordem",
    4: "não se aplica: a vidência destes terrenos não tem alvos",
  },
});
