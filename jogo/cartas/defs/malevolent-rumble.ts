// Malevolent Rumble
// Reveal the top four cards of your library. You may put a permanent card from among them into your hand. Put the rest
// into your graveyard. Create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."
import { chooseItems, createTokens, defineCard, is, moveObjects, nameOf, objItem } from '../../motor/api.ts';

export default defineCard({
  name: 'Malevolent Rumble',
  faces: [{
    spell: {
      *effect(c) {
        const topo = c.g.state.zones.library[c.you].slice(0, 4);
        const perm = topo.filter((id) => is.permanentCard(c, id));
        const esc = perm.length ? yield* chooseItems(c.g, c.you, 'Malevolent Rumble: coloque até uma carta de permanente na mão (o resto vai para o cemitério)', topo.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), disabled: !perm.includes(id) })), 0, 1) : [];
        const mao = esc.map(Number);
        yield* moveObjects(c.g, [...mao.map((id) => ({ id, to: 'hand' as const })), ...topo.filter((id) => !mao.includes(id)).map((id) => ({ id, to: 'graveyard' as const }))], 'effect');
        yield* createTokens(c.g, c.you, 'Eldrazi Spawn', 1);
      },
    },
  }],
  rulings: {},
});
