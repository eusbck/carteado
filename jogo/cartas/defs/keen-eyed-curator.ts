// Keen-Eyed Curator
// As long as there are four or more card types among cards exiled with this creature, it gets +4/+4 and has trample.
// {1}: Exile target card from a graveyard.
import { activated, chars, defineCard, exile, linkedExiled, selfGets, t, tgt } from '../../motor/api.ts';

const CHAVE = 'curador';

export default defineCard({
  name: 'Keen-Eyed Curator',
  faces: [{
    abilities: [
      selfGets((c, o) => {
        // CR 205.2a, 607.2a: tipos de carta distintos, apenas das cartas ainda exiladas por este objeto.
        const tipos = new Set(linkedExiled(c.g, o.id, CHAVE).flatMap((id) => chars(c.g, id).types));
        return tipos.size >= 4 ? [{ k: 'pt', p: 4, t: 4 }, { k: 'addKeyword', kw: 'trample' }] : [];
      }, 'Enquanto houver quatro ou mais tipos de carta entre as cartas exiladas com esta criatura, ela recebe +4/+4 e tem atropelar.'),
      activated('{1}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, { targets: [t.card('graveyard', undefined, 'carta alvo de um cemitério', 'any')], text: '{1}: Exile a carta alvo de um cemitério.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 205.2a: conta tipos de carta distintos, inclusive dois de uma carta, sem supertipos ou subtipos',
  },
});
