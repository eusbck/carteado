// Starfleet Communicator
// When you cast this spell, copy it. (The copy becomes a token.)
// Equipped creature has "Whenever this creature attacks, draw X cards, then you may put up to X land cards from your
// hand onto the battlefield tapped, where X is the number of other creatures you control with a Communicator attached
// to them."
// Equip {1}
import { attachedGets, chars, chooseItems, copySpell, creaturesOf, defineAbility, defineCard, draw, equip, isLand, nameOf, objItem, on, onCastThis, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

/** a criatura tem um Communicator preso a ela? */
function comComunicador(g: G, criatura: ObjId): boolean {
  return g.state.zones.battlefield.some((id) => g.state.objects[id].attachedTo === criatura && chars(g, id).subtypes.includes('Communicator'));
}

const ATACA = defineAbility('Starfleet Communicator:ataca', triggered(on.selfAttacks(), function* (c) {
  // X na resolução: as outras criaturas suas com um Communicator preso
  const x = creaturesOf(c.g, c.you).filter((id) => id !== c.source && comComunicador(c.g, id)).length;
  if (x <= 0) return;
  yield* draw(c.g, c.you, x);
  const terrenos = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
  if (!terrenos.length) return;
  const esc = yield* chooseItems(c.g, c.you, `Starfleet Communicator: você pode pôr até ${x} carta(s) de terreno da sua mão no campo, viradas`, terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, Math.min(x, terrenos.length));
  if (esc.length) yield* putOntoBattlefield(c.g, esc.map((id) => ({ id: Number(id), controller: c.you, tapped: true })), 'effect');
}, { text: 'Sempre que esta criatura ataca, compre X cartas; depois você pode pôr até X cartas de terreno da sua mão no campo, viradas, em que X é o número de outras criaturas que você controla com um Communicator preso a elas.' }));

export default defineCard({
  name: 'Starfleet Communicator',
  faces: [{
    abilities: [
      // CR 707.10, 608.3f: a cópia da mágica de permanente vira uma ficha ao resolver
      onCastThis(function* (c) { yield* copySpell(c.g, c.source, c.you); }, 'Quando você conjura esta mágica, copie-a. (A cópia vira uma ficha.)'),
      attachedGets(() => [{ k: 'addAbility', id: ATACA.id! }], 'A criatura equipada tem "Sempre que esta criatura ataca, compre X cartas; depois você pode pôr até X cartas de terreno da sua mão no campo, viradas, em que X é o número de outras criaturas que você controla com um Communicator preso a elas."'),
      equip('{1}'),
    ],
  }],
  rulings: {},
});
