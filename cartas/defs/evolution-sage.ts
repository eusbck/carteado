// Evolution Sage
// Landfall — Whenever a land you control enters, proliferate.
import { defineCard, on, proliferate, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Evolution Sage',
  faces: [{
    abilities: [triggered(on.landfall(), function* (c) { yield* proliferate(c.g, c.you); }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, prolifere.' })],
  }],
  rulings: {
    1: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam',
    2: 'regra geral: CR 608.2 — escolhas na resolução',
    3: 'regra geral: prolifera mesmo sem escolher nada',
    4: 'regra geral: proliferar permite não escolher todos (testado em Contagion Clasp)',
    5: 'regra geral: permanentes e jogadores de qualquer um, só no campo (testado em Contagion Clasp)',
    6: 'regra geral: um de cada tipo (testado em Contagion Clasp)',
    7: 'não se aplica: nenhuma carta dos decks transforma um permanente em terreno',
    8: 'regra geral: CR 603.3b — o controlador ordena os próprios gatilhos',
    9: 'teste: dispara jogando terreno',
  },
});
