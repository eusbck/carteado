// Mire Blight
// Enchant creature
// When enchanted creature is dealt damage, destroy it.
import { defineCard, destroy, on, t, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Mire Blight',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      // ruling 2: qualquer dano
      triggered(on.custom((e, c) => {
        const enc = c.g.state.objects[c.source]?.attachedTo;
        return e.type === 'damage' && e.target.kind === 'obj' && enc != null && e.target.id === enc ? { criatura: enc } : false;
      }), function* (c) {
        // ruling 1: destrói a criatura encantada quando disparou
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') yield* destroy(c.g, [id]);
      }, { text: 'Quando a criatura encantada sofre dano, destrua-a.' }),
    ],
  }],
  rulings: {
    1: 'teste: destrói a criatura encantada no disparo, mesmo que a Aura saia',
    2: 'regra geral: o gatilho vale para qualquer dano, não só de combate',
  },
});
