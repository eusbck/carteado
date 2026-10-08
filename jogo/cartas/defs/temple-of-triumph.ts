// Temple of Triumph
// This land enters tapped.
// When this land enters, scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// {T}: Add {R} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Temple of Triumph",
  faces: [{ abilities: [
    land.tapped(),
    land.scryOnEnter(),
    mana(['R', 'W']),
  ] }],
  rulings: {
    1: "regra geral: CR 608.2c — instruções em ordem",
    2: "não se aplica: a vidência destes terrenos não tem alvos",
    3: "regra geral: CR 701.22a — a decisão de vidência ordena o topo e o fundo (lookAndArrange)",
    4: "regra geral: CR 701.22a — cada carta vai para o topo ou o fundo à escolha (lookAndArrange)",
  },
});
