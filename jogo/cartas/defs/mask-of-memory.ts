// Mask of Memory
// Whenever equipped creature deals combat damage to a player, you may draw two cards. If you do, discard a card.
// Equip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)
import { defineCard, discard, draw, equip, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Mask of Memory',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.source === (c.g.state.objects[c.source]?.attachedTo ?? -1)), function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Mask of Memory: comprar duas cartas e depois descartar uma?'))) return;
        yield* draw(c.g, c.you, 2);
        yield* discard(c.g, c.you, 1);
      }, { text: 'Sempre que a criatura equipada causa dano de combate a um jogador, você pode comprar duas cartas. Se fizer isso, descarte uma carta.' }),
      equip('{1}'),
    ],
  }],
  rulings: {},
});