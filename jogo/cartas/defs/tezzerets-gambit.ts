// Tezzeret's Gambit
// ({U/P} can be paid with either {U} or 2 life.)
// Draw two cards, then proliferate. (Choose any number of permanents and/or players, then give each another counter of
// each kind already there.)
import { defineCard, draw, proliferate } from '../../motor/api.ts';

export default defineCard({
  name: "Tezzeret's Gambit",
  faces: [{
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 2);
        // CR 701.34: proliferar (motor/mecanicas.ts)
        yield* proliferate(c.g, c.you);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam (motor/sba.ts)',
    2: 'teste: compra duas e prolifera, escolhendo permanentes de qualquer jogador',
    3: 'regra geral: CR 701.34a — escolhe quantos quiser, inclusive nenhum (motor/mecanicas.ts proliferate)',
    4: 'regra geral: CR 701.34a — cada escolhido ganha um de cada tipo que já tem (motor/mecanicas.ts proliferate)',
    5: 'não se aplica: nenhuma carta dos decks tem "sempre que você prolifera"',
    6: 'regra geral: CR 608.2 — as escolhas são feitas na resolução, sem respostas no meio',
    7: 'regra geral: CR 202.3f — mana phyrexiana conta 1 no valor de mana (motor/mana.ts)',
    8: 'regra geral: CR 601.2f — a forma de pagar a mana phyrexiana é escolhida ao pagar o custo (motor/costs.ts)',
    9: 'teste: paga {U/P} com 2 de vida',
    10: 'regra geral: CR 107.4f — mana phyrexiana não é cor nova',
    11: 'regra geral: CR 202.2 — a carta é azul, seja como for paga',
  },
});
