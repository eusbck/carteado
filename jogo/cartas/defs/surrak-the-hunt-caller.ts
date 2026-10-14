// Surrak, the Hunt Caller
// Formidable — At the beginning of combat on your turn, if creatures you control have total power 8 or greater, target
// creature you control gains haste until end of turn. (It can attack and {T} no matter when it came under your control.)
import { defineCard, is, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { forcaTotal } from '../dinossauros.ts';

export default defineCard({
  name: 'Surrak, the Hunt Caller',
  faces: [{
    abilities: [
      // CR 603.4: "se" interveniente, conferido ao disparar e ao resolver (ruling 3); força negativa subtrai (ruling 1)
      triggered(on.beginCombat('you'), function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'haste' }]);
      }, {
        condition: (c) => forcaTotal(c.g, c.you) >= 8,
        targets: [t.creature(is.yours, 'criatura alvo que você controla')],
        text: 'Formidável — No início do combate no seu turno, se as criaturas que você controla têm força total 8 ou mais, a criatura alvo que você controla ganha ímpeto até o fim do turno.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: a força total soma as forças como estão, inclusive negativas (cartas/dinossauros.ts forcaTotal)',
    2: 'não se aplica: Surrak não tem habilidade formidável ativada',
    3: 'teste: com força total 8 ou mais no início do combate, a criatura alvo ganha ímpeto e ataca; com menos, nada',
  },
});
