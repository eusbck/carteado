// The Borg Queen
// Artifact creatures you control get +2/+2.
// Whenever The Borg Queen enters or attacks, target opponent exiles cards from the top of their library until they
// exile a creature card. Assimilate that card. They put the rest on the bottom in a random order. (To assimilate a
// card, put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses
// all other creature types.)
import { defineCard, on, t, tgtPlayer, triggered } from '../../motor/api.ts';
import type { EffectFn } from '../../motor/defs.ts';
import { artefatosRecebem, exilaAteCriaturaEAssimila } from '../borg.ts';

const efeito: EffectFn = function* (c) {
  const op = tgtPlayer(c);
  if (op !== null) yield* exilaAteCriaturaEAssimila(c, op);
};
const TEXTO = 'Sempre que The Borg Queen entra ou ataca, o oponente alvo exila cartas do topo do grimório até exilar uma carta de criatura. Assimile essa carta. Ele põe o resto no fundo em ordem aleatória.';

export default defineCard({
  name: 'The Borg Queen',
  faces: [{
    abilities: [
      artefatosRecebem([{ k: 'pt', p: 2, t: 2 }], 'As criaturas artefato que você controla recebem +2/+2.'),
      triggered(on.selfEnters(), efeito, { targets: [t.opponent()], text: TEXTO }),
      triggered(on.selfAttacks(), efeito, { targets: [t.opponent()], text: TEXTO }),
    ],
  }],
  rulings: {},
});
