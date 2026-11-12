// Evolution Witness
// {1}{G}: Adapt 2. (If this creature has no +1/+1 counters on it, put two +1/+1 counters on it.)
// Whenever one or more +1/+1 counters are put on this creature, return target permanent card from your graveyard to
// your hand.
import { activated, defineCard, is, moveObjects, on, t, tgt, triggered } from '../../motor/api.ts';
import { adaptar } from '../saque.ts';

export default defineCard({
  name: 'Evolution Witness',
  faces: [{
    abilities: [
      activated('{1}{G}', function* (c) {
        // CR 701.46a: só põe marcadores se não houver nenhum +1/+1 (ruling 1)
        adaptar(c.g, c.source, 2, c.you);
      }, { text: '{1}{G}: Adaptar 2. (Se esta criatura não tiver marcadores +1/+1, coloque dois marcadores +1/+1 nela.)' }),
      triggered(on.custom((e, c) => e.type === 'counters' && e.kind === '+1/+1' && e.amount > 0 && e.target.kind === 'obj' && e.target.id === c.source), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', is.permanentCard, 'carta de permanente alvo do seu cemitério', 'you')],
        text: 'Sempre que um ou mais marcadores +1/+1 são colocados nesta criatura, devolva a carta de permanente alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: adaptar põe dois marcadores e devolve uma carta de permanente; com marcador, adaptar não põe nada',
    2: 'regra geral: CR 701.46a — sem marcadores +1/+1 de novo, adapta outra vez (cartas/saque.ts adaptar)',
  },
});
