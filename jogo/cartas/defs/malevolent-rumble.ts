// Malevolent Rumble
// Reveal the top four cards of your library. You may put a permanent card from among them into your hand. Put the rest
// into your graveyard. Create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."
import { chooseItems, createTokens, defineCard, isPermanentCard, moveObjects, nameOf, objItem } from '../../motor/api.ts';
import { jog, objs, reg } from '../../motor/registro.ts';

export default defineCard({
  name: 'Malevolent Rumble',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 4);
        if (topo.length) {
          reg(c.g, 'revela', { rule: '701.20' })`${jog(c.you)} revela ${objs(topo)}.`;
          const cands = topo.filter((id) => isPermanentCard(c.g, id));
          const esc = cands.length ? yield* chooseItems(c.g, c.you, 'Malevolent Rumble: você pode colocar uma carta de permanente na sua mão', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1) : [];
          const mao = esc.map(Number);
          yield* moveObjects(c.g, [...mao.map((id) => ({ id, to: 'hand' as const })), ...topo.filter((id) => !mao.includes(id)).map((id) => ({ id, to: 'graveyard' as const }))], 'effect');
        }
        yield* createTokens(c.g, c.you, 'Eldrazi Spawn', 1);
      },
    },
  }],
  rulings: {},
});
