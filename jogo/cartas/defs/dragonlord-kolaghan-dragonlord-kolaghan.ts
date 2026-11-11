// Dragonlord Kolaghan // Dragonlord Kolaghan (carta reversível: as duas faces são iguais e vale a da frente)
// Dragonlord Kolaghan {4}{B}{R} — Legendary Creature — Elder Dragon 6/5
// Flying, haste
// Other creatures you control have haste.
// Whenever an opponent casts a creature or planeswalker spell with the same name as a card in their graveyard, that
// player loses 10 life.
import { anthem, chars, controllerOf, defineCard, isCreature, keywords, loseLife, nameOf, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Dragonlord Kolaghan // Dragonlord Kolaghan',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      anthem((c, id) => id !== c.source && isCreature(c.g, id) && controllerOf(c.g, id) === c.you, () => [{ k: 'addKeyword', kw: 'haste' }], 'As outras criaturas que você controla têm ímpeto.'),
      // ruling 1: virada para baixo, a mágica não tem nome; ruling 2: o cemitério é olhado quando a mágica já foi conjurada
      // (o que saiu pelo delve não conta)
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || !c.g.isOpponent(c.you, e.player) || !c.g.state.objects[e.obj]) return false;
        const ch = chars(c.g, e.obj);
        if (!ch.name || !(ch.types.includes('Creature') || ch.types.includes('Planeswalker'))) return false;
        return c.g.state.zones.graveyard[e.player].some((id) => nameOf(c.g, id) === ch.name) ? { jogador: e.player } : false;
      }), function* (c) {
        const p = c.event.jogador as PlayerId;
        if (!c.g.state.players[p].left) loseLife(c.g, p, 10, c.source);
      }, { text: 'Sempre que um oponente conjura uma mágica de criatura ou planeswalker com o mesmo nome de uma carta no cemitério dele, esse jogador perde 10 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 708.2a — a mágica virada para baixo não tem nome (motor/chars.ts)',
    2: 'regra geral: CR 601.2i — o gatilho olha o cemitério depois de a mágica ser conjurada, com o delve já pago (motor/stack.ts)',
  },
});
