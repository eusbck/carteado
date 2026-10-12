// Shard of the Void Dragon
// Flying
// Spear of the Void Dragon — Whenever this creature attacks, each opponent sacrifices a nonland permanent of their choice.
// Matter Absorption — Whenever an artifact is put into a graveyard from the battlefield or is put into exile from the
// battlefield, put two +1/+1 counters on this creature.
import { addCounters, defineCard, eachSacrifices, isLand, keyword, lkiChars, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Shard of the Void Dragon',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        yield* eachSacrifices(c, c.g.opponents(c.you), (id) => !isLand(c.g, id), 1, 'uma permanente que não é terreno');
      }, { text: 'Spear of the Void Dragon — Sempre que esta criatura ataca, cada oponente sacrifica uma permanente que não é terreno à escolha dele.' }),
      triggered(on.custom((e, c) => e.type === 'zone' && e.from === 'battlefield' && (e.to === 'graveyard' || e.to === 'exile') && !!lkiChars(c.g, e.old)?.types.includes('Artifact')), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 2, c.you);
      }, { text: 'Matter Absorption — Sempre que um artefato é colocado num cemitério vindo do campo ou é exilado do campo, coloque dois marcadores +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {},
});