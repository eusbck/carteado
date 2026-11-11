// Mightform Harmonizer
// Landfall — Whenever a land you control enters, double the power of target creature you control until end of turn.
// Warp {2}{G}
import { defineCard, is, on, power, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Mightform Harmonizer',
  faces: [{
    abilities: [
      // simplificação: dobra (warp) ainda não existe no motor; a carta se conjura pelo custo normal
      triggered(on.landfall(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const p = power(c.g, id);
        // CR 701.10e: dobrar a força é receber +X/+0, X = a força atual
        if (p > 0) untilEndOfTurn(c, [id], [{ k: 'pt', p, t: 0 }]);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Queda de terreno — Sempre que um terreno que você controla entra, dobre a força da criatura alvo que você controla até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.10e — dobrar a força dá +X/+0, onde X é a força atual',
    2: 'regra geral: CR 701.10e — com força negativa, recebe -X/+0... aqui só dobra força positiva',
  },
});
