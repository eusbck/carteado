// Extract Power
// Look at the top card of each player's library, then exile those cards face down. You may play them without paying their
// mana costs for as long as they remain exiled.
import { allowPlay, defineCard, moveObjects } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Extract Power',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topos = c.g.playersInGame().flatMap((p) => (s.zones.library[p].length ? [s.zones.library[p][0]] : []));
        if (!topos.length) return;
        // exiladas viradas para baixo; só você pode olhá-las (CR 406.3)
        const res = yield* moveObjects(c.g, topos.map((id) => ({ id, to: 'exile' as const, faceDown: true, visibleTo: [c.you] })), 'exile');
        const exiladas = res.filter((x): x is ObjId => x !== null && s.objects[x]?.zone === 'exile');
        // enquanto continuarem exiladas: sem prazo, e a permissão cai quando a carta sai do exílio
        allowPlay(c.g, c.you, c.source, exiladas, { kind: 'permanent' }, { free: true });
      },
    },
  }],
  rulings: {},
});
