// Archnemesis
// Enchant opponent
// Whenever you attack enchanted player, that player loses 2 life. You draw a card and gain 2 life.
// Whenever a player attacks you, you may attach this Aura to that player.
import { defineCard, draw, gainLife, loseLife, on, t, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Archnemesis',
  faces: [{
    // CR 303.4b: a Aura encanta um jogador; o motor guarda quem em data.enchantedPlayer (motor/stack.ts)
    enchant: t.opponent('oponente'),
    abilities: [
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const p = c.g.state.objects[c.source]?.data.enchantedPlayer;
        return typeof p === 'number' && e.attackers.some((a) => a.target.kind === 'player' && a.target.id === p) ? { jogador: p } : false;
      }), function* (c) {
        loseLife(c.g, c.event.jogador as PlayerId, 2, c.source);
        yield* draw(c.g, c.you, 1);
        gainLife(c.g, c.you, 2, c.source);
      }, { text: 'Sempre que você ataca o jogador encantado, esse jogador perde 2 de vida. Você compra uma carta e ganha 2 de vida.' }),
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.player !== c.you && e.attackers.some((a) => a.target.kind === 'player' && a.target.id === c.you) ? { jogador: e.player } : false)), function* (c) {
        const o = c.g.state.objects[c.source];
        const p = c.event.jogador as PlayerId;
        // só pode ser anexada a quem ela pode encantar (um oponente ainda na partida); já nele, nada muda
        if (!o || o.zone !== 'battlefield' || c.g.state.players[p].left || !c.g.isOpponent(c.you, p) || o.data.enchantedPlayer === p) return;
        if (!(yield* yesNo(c.g, c.you, `Archnemesis: anexar a ${c.g.state.players[p].name}?`))) return;
        o.data.enchantedPlayer = p;
        o.data.auraUnattachedOk = true;
        c.g.bump();
      }, { text: 'Sempre que um jogador ataca você, você pode anexar esta Aura a esse jogador.' }),
    ],
  }],
  rulings: {},
});
