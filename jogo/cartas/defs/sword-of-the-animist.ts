// Sword of the Animist
// Equipped creature gets +1/+1.
// Whenever equipped creature attacks, you may search your library for a basic land card, put it onto the battlefield
// tapped, then shuffle.
// Equip {2}
import { attachedGets, defineCard, equip, maySearchBasicToBattlefield, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Sword of the Animist',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 1, t: 1 }], 'A criatura equipada recebe +1/+1.'),
      triggered(on.custom((e, c) => {
        const equipada = c.g.state.objects[c.source]?.attachedTo;
        return e.type === 'attackers' && equipada !== null && equipada !== undefined && e.attackers.some((a) => a.obj === equipada);
      }), function* (c) { yield* maySearchBasicToBattlefield(c, c.you, true); }, { text: 'Sempre que a criatura equipada ataca, você pode procurar no seu grimório uma carta de terreno básico, colocá-la no campo virada e depois embaralhar.' }),
      equip('{2}'),
    ],
  }],
  rulings: {},
});