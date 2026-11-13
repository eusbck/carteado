// Armorcraft Judge
// When this creature enters, draw a card for each creature you control with a +1/+1 counter on it.
import { defineCard, draw, etb } from '../../motor/api.ts';
import { comMarcadorMaisUm } from '../voja.ts';

export default defineCard({
  name: 'Armorcraft Judge',
  faces: [{
    abilities: [
      etb(function* (c) {
        // ruling 1: conta na resolução; ruling 2: conta criaturas, não marcadores
        const n = comMarcadorMaisUm(c.g, c.you).length;
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Quando esta criatura entra, compre uma carta para cada criatura que você controla com um marcador +1/+1.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2h — a quantidade é contada na resolução',
    2: 'teste: compra uma carta por criatura com marcador, não por marcador',
  },
});
