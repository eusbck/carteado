// Frantic Search
// Draw two cards, then discard two cards. Untap up to three lands.
import { chooseItems, defineCard, discard, draw, isLand, nameOf, objItem, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Frantic Search',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 2: compra e descarta durante a resolução, sem nada no meio
        yield* draw(c.g, c.you, 2);
        yield* discard(c.g, c.you, 2);
        // ruling 1: os terrenos são escolhidos na resolução, não são alvos e não precisam ser seus
        const s = c.g.state;
        const virados = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && isLand(c.g, id) && s.objects[id].tapped);
        if (!virados.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Frantic Search: desvire até três terrenos', virados.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (${s.players[s.objects[id].controller].name})`)), 0, Math.min(3, virados.length));
        for (const id of esc.map(Number)) untap(c.g, id);
      },
    },
  }],
  rulings: {
    1: 'teste: compra duas, descarta duas e desvira até três terrenos escolhidos na resolução, de qualquer jogador',
    2: 'teste: compra duas, descarta duas e desvira até três terrenos escolhidos na resolução, de qualquer jogador',
  },
});
