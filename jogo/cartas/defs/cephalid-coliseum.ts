// Cephalid Coliseum
// {T}: Add {U}. This land deals 1 damage to you.
// Threshold — {U}, {T}, Sacrifice this land: Target player draws three cards, then discards three cards. Activate only
// if there are seven or more cards in your graveyard.
import { activated, defineCard, discard, draw, land, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Cephalid Coliseum',
  faces: [{
    abilities: [
      land.pain(['U']),
      // limiar: sete ou mais cartas no seu cemitério ao ativar
      activated('{U}, {T}, Sacrifice this land', function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        yield* draw(c.g, p, 3);
        yield* discard(c.g, p, 3);
      }, {
        targets: [t.player()],
        condition: (c) => c.g.state.zones.graveyard[c.you].length >= 7,
        text: 'Limiar — {U}, {T}, Sacrifique este terreno: O jogador alvo compra três cartas e depois descarta três cartas. Ative somente se houver sete ou mais cartas no seu cemitério.',
      }),
    ],
  }],
  rulings: {},
});
