// Unnatural Growth
// At the beginning of each combat, double the power and toughness of each creature you control until end of turn.
import { creaturesOf, defineCard, on, power, toughness, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Unnatural Growth',
  faces: [{
    abilities: [
      // CR 701.10b-c: dobrar é receber +X/+Y com X e Y a força e a resistência na resolução (negativa vira -X);
      // duas cópias dobram uma depois da outra (ruling 1)
      triggered(on.beginCombat('each'), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) {
          const p = power(c.g, id);
          const r = toughness(c.g, id);
          if (p !== 0 || r !== 0) untilEndOfTurn(c, [id], [{ k: 'pt', p, t: r }]);
        }
      }, { text: 'No início de cada combate, dobre a força e a resistência de cada criatura que você controla até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: no início de cada combate, dobra; com duas, a 2/10 vira 8/40',
  },
});
