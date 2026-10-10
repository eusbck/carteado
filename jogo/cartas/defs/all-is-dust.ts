// All Is Dust
// Each player sacrifices all permanents they control that are one or more colors.
import { chars, defineCard, permanentsMatching, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: "All Is Dust",
  faces: [{ spell: { effect: function*(c) { yield* sacrifice(c.g, permanentsMatching(c.g, (id) => chars(c.g, id).colors.length > 0)); } } }],
  rulings: {
    "1": "CR 205.1: tribal foi renomeado Kindred nos dados Oracle; não altera o efeito de sacrifício.",
    "2": "CR 205.2a: Kindred permanece um tipo de carta nos dados Oracle e no sistema de tipos.",
    "3": "CR 205.3m: o tipo Kindred permite subtipos de criatura em mágicas não criatura; os dados preservam Eldrazi.",
    "4": "CR 202.2: produzir mana colorida não confere cor ao terreno; teste: Island é preservada.",
    "5": "CR 701.17: sacrifício não é destruição; teste: indestrutível colorida é sacrificada.",
    "6": "CR 111.3, 105.2: cores das fichas vêm da definição; teste: ficha preta é sacrificada e Thopter incolor é preservado.",
    "7": "CR 608.2c: todos os permanentes coloridos de todos os jogadores são sacrificados no mesmo lote.",
    "8": "CR 202.2: terreno sem custo de mana é incolor salvo efeito de cor; a seleção usa características atuais."
  },
});
