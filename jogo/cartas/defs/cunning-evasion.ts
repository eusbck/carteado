// Cunning Evasion
// Whenever a creature you control becomes blocked, you may return it to its owner's hand.
import { controllerOf, defineCard, isCreature, nameOf, on, returnToHand, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Cunning Evasion',
  faces: [{
    abilities: [
      // CR 509.1h: um gatilho para cada criatura sua que ficou bloqueada
      triggered(on.custom((e, c) => {
        if (e.type !== 'blockers') return false;
        const atacantes = [...new Set(e.blocks.map(([, a]) => a))];
        return atacantes.filter((id) => !!c.g.state.objects[id] && isCreature(c.g, id) && controllerOf(c.g, id) === c.you).map((criatura) => ({ criatura }));
      }), function* (c) {
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone !== 'battlefield') return;
        if (yield* yesNo(c.g, c.you, `Cunning Evasion: devolver ${nameOf(c.g, id)} à mão do dono?`)) yield* returnToHand(c.g, [id]);
      }, { text: 'Sempre que uma criatura que você controla fica bloqueada, você pode devolvê-la à mão do dono.' }),
    ],
  }],
  rulings: { 1: 'teste: a criatura bloqueada volta para a mão antes do dano e não causa nem recebe dano de combate' },
});
