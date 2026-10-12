// Dismantling Wave
// For each opponent, destroy up to one target artifact or enchantment that player controls.
// Cycling {6}{W}{W} ({6}{W}{W}, Discard this card: Draw a card.)
// When you cycle this card, destroy all artifacts and enchantments.
import { and, controllerOf, cycling, defineCard, destroy, is, isType, lkiObj, on, or, t, triggered, upTo } from '../../motor/api.ts';

const ciclagem = cycling('{6}{W}{W}');

export default defineCard({
  name: 'Dismantling Wave',
  faces: [{
    abilities: [
      ciclagem,
      // CR 702.29c: dispara da zona em que a carta foi parar; rulings 1 e 3: independente da compra da ciclagem
      triggered(on.custom((e, c) => {
        if (e.type !== 'activate' || e.abilityId !== ciclagem.id) return false;
        const antes = lkiObj(c.g, e.source);
        return !!antes && antes.card !== null && antes.card === c.obj.card;
      }), function* (c) {
        const ids = c.g.state.zones.battlefield.filter((id) => isType(c.g, id, 'Artifact') || isType(c.g, id, 'Enchantment'));
        if (ids.length) yield* destroy(c.g, ids);
      }, { zones: ['graveyard', 'exile'], text: 'Quando você cicla esta carta, destrua todos os artefatos e encantamentos.' }),
    ],
    spell: {
      // até um de cada oponente: no máximo três oponentes numa mesa de quatro
      targets: [{
        ...upTo(3, t.permanent(and(or(is.artifact, is.enchantment), is.opponents), 'artefato ou encantamento alvo de cada oponente (até um por oponente)')),
        validateSet: (c, alvos) => {
          const donos = alvos.map((r) => (r.kind === 'obj' ? controllerOf(c.g, r.id) : -1));
          return new Set(donos).size === donos.length;
        },
      }],
      *effect(c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield' ? [r.id] : []));
        if (ids.length) yield* destroy(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.29c — o gatilho de ciclar resolve antes da compra da ciclagem (motor/dsl.ts cycling)',
    2: 'regra geral: CR 702.29a — a ciclagem e o gatilho dela são habilidades, não mágicas (motor/dsl.ts cycling)',
    3: 'teste: ciclando, destrói todos os artefatos e encantamentos e ainda compra a carta',
  },
});