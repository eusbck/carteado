// Moonsnare Specialist
// Ninjutsu {2}{U} ({2}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// When this creature enters, return up to one target creature to its owner's hand.
import { defineCard, etb, ninjutsu, returnToHand, t, tgt, upTo } from '../../motor/api.ts';
import { NINJUTSU } from '../ninjas.ts';

export default defineCard({
  name: 'Moonsnare Specialist',
  faces: [{
    abilities: [
      ninjutsu('{2}{U}'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* returnToHand(c.g, [id]);
      }, { targets: [upTo(1, t.creature(undefined, 'até uma criatura alvo'))], text: 'Quando esta criatura entra, devolva até uma criatura alvo à mão do dono.' }),
    ],
  }],
  rulings: {
    1: NINJUTSU.depoisDosBloqueios,
    2: NINJUTSU.revela,
    3: NINJUTSU.mesmoJogador,
    4: NINJUTSU.naoDeclarada,
    5: NINJUTSU.etapas,
    6: NINJUTSU.primeiroGolpe,
    7: 'não se aplica: piada da carta (sem regra)',
  },
});
