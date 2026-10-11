// Marvo, Deep Operative
// Whenever Marvo attacks, clash with defending player. (Each clashing player reveals the top card of their library, then
// puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)
// Whenever you win a clash, draw a card. Then you may cast a spell from your hand with mana value 8 or less without
// paying its mana cost.
import { castSpell, chooseItems, clash, controllerOf, defineCard, draw, isLand, manaValue, nameOf, objItem, on, onYouWinClash, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Marvo, Deep Operative',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const s = c.g.state;
        const a = s.combat?.attackers.find((x) => x.id === c.source);
        if (!a) return;
        // jogador defensor: o atacado, ou o controlador do planeswalker atacado (CR 506.2, 508.5)
        const defensor = a.target.kind === 'player' ? a.target.id : s.objects[a.target.id] ? controllerOf(c.g, a.target.id) : null;
        if (defensor === null || s.players[defensor].left) return;
        yield* clash(c.g, c.you, defensor);
      }, { text: 'Sempre que Marvo ataca, entre em confronto com o jogador defensor. (Cada jogador em confronto revela a carta do topo do próprio grimório e depois a coloca no topo ou no fundo. Vence quem revelou a carta com o maior valor de mana.)' }),
      triggered(onYouWinClash(), function* (c) {
        const s = c.g.state;
        yield* draw(c.g, c.you, 1);
        const cartas = s.zones.hand[c.you].filter((id) => !isLand(c.g, id) && manaValue(c.g, id) <= 8);
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Marvo: você pode conjurar uma mágica da sua mão com valor de mana 8 ou menos sem pagar o custo de mana', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (!esc.length) return;
        // CR 608.2g: conjurada durante a resolução
        yield* castSpell(c.g, c.you, Number(esc[0]), { key: 'free', label: 'sem pagar o custo de mana', zone: 'hand', free: true, duringResolution: true });
      }, { text: 'Sempre que você vence um confronto, compre uma carta. Depois você pode conjurar uma mágica da sua mão com valor de mana 8 ou menos sem pagar o custo de mana.' }),
    ],
  }],
  rulings: {},
});
