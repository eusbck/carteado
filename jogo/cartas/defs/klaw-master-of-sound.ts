// Klaw, Master of Sound
// Deathtouch
// Whenever you play a card from exile, Klaw gains indestructible until end of turn.
// Whenever Klaw deals combat damage to a player, look at the top card of that player's library, then exile it face down.
// You may play it for as long as it remains exiled. Mana of any type can be spent to cast a spell this way.
import { allowPlay, defineCard, keyword, moveObjects, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Klaw, Master of Sound',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      // jogar = conjurar uma mágica do exílio ou jogar um terreno do exílio (o motor marca a causa 'play' no terreno)
      triggered(on.custom((e, c) => (e.type === 'cast' && !e.copy && e.player === c.you && e.from === 'exile')
        || (e.type === 'zone' && e.cause === 'play' && e.from === 'exile' && e.to === 'battlefield' && e.controller === c.you)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: 'Sempre que você joga uma carta do exílio, Klaw ganha indestrutível até o fim do turno.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        const p = c.event.player as PlayerId;
        const topo = s.zones.library[p][0];
        if (topo === undefined) return;
        // virada para baixo; só você pode olhá-la (CR 406.3)
        const [ex] = yield* moveObjects(c.g, [{ id: topo, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile');
        if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return;
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { anyType: true });
      }, { text: 'Sempre que Klaw causa dano de combate a um jogador, olhe a carta do topo do grimório desse jogador e exile-a virada para baixo. Você pode jogá-la enquanto ela continuar exilada. Mana de qualquer tipo pode ser gasta para conjurar uma mágica assim.' }),
    ],
  }],
  rulings: {},
});
