// Temple of Plenty
// This land enters tapped.
// When this land enters, scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// {T}: Add {G} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Temple of Plenty",
  faces: [{ abilities: [
    land.tapped(),
    land.scryOnEnter(),
    mana(['G', 'W']),
  ] }],
  rulings: {
    1: "regra geral: CR 701.22a — a decisão de vidência ordena o topo e o fundo (lookAndArrange)",
    2: "regra geral: CR 608.2c — instruções em ordem",
    3: "não se aplica: a vidência destes terrenos não tem alvos",
    4: "regra geral: CR 701.22a — cada carta vai para o topo ou o fundo à escolha (lookAndArrange)",
  },
});
