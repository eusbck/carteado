// Shielded by Faith
// Enchant creature
// Enchanted creature has indestructible.
// Whenever a creature enters, you may attach this Aura to that creature.
import { attach, attachedGets, defineCard, enchantCandidates, is, nameOf, on, t, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Shielded by Faith',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'indestructible' }], 'A criatura encantada tem indestrutível.'),
      triggered(on.enters(is.creature), function* (c) {
        const id = c.event.obj as ObjId;
        const s = c.g.state;
        if (s.objects[c.source]?.zone !== 'battlefield' || s.objects[id]?.zone !== 'battlefield') return;
        // CR 303.4j: só se a Aura puder encantar a criatura (proteção etc.)
        if (!enchantCandidates(c.g, 'Shielded by Faith', 0, c.you, [], c.source).includes(id)) return;
        if (yield* yesNo(c.g, c.you, `Shielded by Faith: prender a Aura em ${nameOf(c.g, id)}?`)) attach(c.g, c.source, id);
      }, { text: 'Sempre que uma criatura entra, você pode prender esta Aura a essa criatura.' }),
    ],
  }],
});
