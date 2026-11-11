// Death Is Irrelevant
// Artifact creatures you control have indestructible.
// At the beginning of your end step, assimilate target creature card from a graveyard. (Put it onto the battlefield
// under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)
import { and, anthem, defineCard, is, on, t, tgt, triggered } from '../../motor/api.ts';
import { assimilar } from '../borg.ts';

export default defineCard({
  name: 'Death Is Irrelevant',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.artifact, is.yours), () => [{ k: 'addKeyword', kw: 'indestructible' }], 'As criaturas-artefato que você controla têm indestrutível.'),
      triggered(on.endStep('you'), function* (c) { const id = tgt(c); if (id !== null) yield* assimilar(c, id); }, {
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo de um cemitério', 'any')],
        text: 'No início da sua etapa final, assimile a carta de criatura alvo de um cemitério.',
      }),
    ],
  }],
  rulings: {},
});
