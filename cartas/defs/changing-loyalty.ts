// Changing Loyalty
// Flash
// Replicate {2} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new
// targets for the copies. Copies become tokens.)
// Enchant creature
// When enchanted creature dies, return it to the battlefield under your control.
import { defineCard, keyword, on, putOntoBattlefield, replicate, t, triggered } from '../../motor/api.ts';

const REPLICAR = replicate('{2}');

export default defineCard({
  name: 'Changing Loyalty',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    additionalCosts: [REPLICAR.cost],
    abilities: [
      keyword('flash'),
      REPLICAR.trigger,
      triggered(on.dies((c, _l, o) => c.obj.attachedTo === o.id), function* (c) {
        const novo = c.g.state.lki[c.event.old as number]?.newId ?? null;
        if (novo !== null && c.g.state.objects[novo]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: novo, controller: c.you }], 'effect');
      }, { text: 'Quando a criatura encantada morre, devolva-a ao campo sob o seu controle.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — cópias não são conjuradas',
    2: 'regra geral: o gatilho de replicar pode ser anulado como qualquer habilidade',
    3: 'regra geral: cada cópia é anulada separadamente',
    4: 'teste: copia mesmo que a original já tenha saído da pilha',
  },
});
