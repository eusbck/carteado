// The Wasp, Winsome Avenger
// Flash
// Flying
// When The Wasp enters, target Hero gains hexproof until end of turn.
// Whenever The Wasp attacks, tap target creature defending player controls.
import { controllerOf, defineCard, etb, keywords, on, t, tap, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: 'The Wasp, Winsome Avenger',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'hexproof' }]);
      }, { targets: [t.permanent((c, id) => ehHeroi(c.g, id), 'Hero alvo')], text: 'Quando The Wasp entra, o Hero alvo ganha resistência a magia até o fim do turno.' }),
      // o jogador defensor é o que The Wasp ataca (ou quem controla o planeswalker ou a batalha atacada)
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        const a = e.attackers.find((x) => x.obj === c.source);
        if (!a) return false;
        return { defensor: a.target.kind === 'player' ? a.target.id : controllerOf(c.g, a.target.id) };
      }), function* (c) {
        const id = tgt(c);
        if (id !== null) tap(c.g, id);
      }, {
        targets: [t.creature((c, id) => controllerOf(c.g, id) === (c.event?.defensor as number | undefined), 'criatura alvo que o jogador defensor controla')],
        text: 'Sempre que The Wasp ataca, vire a criatura alvo que o jogador defensor controla.',
      }),
    ],
  }],
  rulings: {},
});