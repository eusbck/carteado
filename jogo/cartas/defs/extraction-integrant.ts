// Extraction Integrant
// Artifact creatures you control have menace and "Whenever a creature blocks this creature, that creature gets -1/-1
// until end of turn."
import { defineAbility, defineCard, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { artefatosRecebem } from '../borg.ts';

// um disparo por criatura que bloqueia esta
const HAB = 'Extraction Integrant:bloqueada';
defineAbility(HAB, triggered(on.custom((e, c) => (e.type === 'blockers' ? e.blocks.filter(([, a]) => a === c.source).map(([b]) => ({ bloqueador: b })) : false)), function* (c) {
  const b = c.event.bloqueador as ObjId;
  if (c.g.state.objects[b]?.zone === 'battlefield') untilEndOfTurn(c, [b], [{ k: 'pt', p: -1, t: -1 }]);
}, { text: 'Sempre que uma criatura bloqueia esta criatura, aquela criatura recebe -1/-1 até o fim do turno.' }));

export default defineCard({
  name: 'Extraction Integrant',
  faces: [{
    abilities: [
      artefatosRecebem([{ k: 'addKeyword', kw: 'menace' }, { k: 'addAbility', id: HAB }], 'As criaturas artefato que você controla têm ameaçar e "Sempre que uma criatura bloqueia esta criatura, aquela criatura recebe -1/-1 até o fim do turno."'),
    ],
  }],
  rulings: {},
});
