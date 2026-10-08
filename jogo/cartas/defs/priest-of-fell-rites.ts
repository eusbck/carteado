// Priest of Fell Rites
// {T}, Pay 3 life, Sacrifice this creature: Return target creature card from your graveyard to the battlefield. Activate
// only as a sorcery.
// Unearth {3}{W}{B}
import { activated, defineCard, is, putOntoBattlefield, t, tgt, unearth } from '../../motor/api.ts';

export default defineCard({
  name: 'Priest of Fell Rites',
  faces: [{
    abilities: [
      // ruling 3: o alvo é escolhido antes de pagar (CR 602.2b) — o próprio Priest ainda está no campo
      activated('{T}, Pay 3 life, Sacrifice this creature', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, { timing: 'sorcery', targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')], text: '{T}, Pague 3 de vida, Sacrifique esta criatura: Devolva a carta de criatura alvo do seu cemitério ao campo. Ative só como feitiço.' }),
      unearth('{3}{W}{B}'),
    ],
  }],
  rulings: {
    1: 'teste: desenterrada, é exilada se fosse sair do campo',
    2: 'regra geral: CR 702.84a — desenterrar é habilidade ativada, não mágica',
    3: 'teste: não pode mirar a si mesma',
  },
});
