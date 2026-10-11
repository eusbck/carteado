// Crossway Troublemakers
// Attacking Vampires you control have deathtouch and lifelink. (Any amount of damage they deal to a creature is enough to
// destroy it. Damage dealt by those creatures also causes their controller to gain that much life.)
// Whenever a Vampire you control dies, you may pay 2 life. If you do, draw a card.
import { and, anthem, defineCard, draw, is, isAttacking, loseLife, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Crossway Troublemakers',
  faces: [{
    abilities: [
      anthem(and(is.subtype('Vampire'), is.yours, (c, id) => isAttacking(c.g, id)), () => [{ k: 'addKeyword', kw: 'deathtouch' }, { k: 'addKeyword', kw: 'lifelink' }], 'Os Vampires atacantes que você controla têm toque mortífero e vínculo com a vida.'),
      // ruling 1: uma vez para cada Vampire que morre; pagar vida só com vida suficiente (CR 119.4)
      triggered(on.dies((c, lki) => lki.controller === c.you && lki.subtypes.includes('Vampire')), function* (c) {
        if (c.g.state.players[c.you].life < 2) return;
        if (!(yield* yesNo(c.g, c.you, 'Crossway Troublemakers: pagar 2 de vida para comprar uma carta?'))) return;
        loseLife(c.g, c.you, 2, c.source);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um Vampire que você controla morre, você pode pagar 2 de vida. Se fizer isso, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: quando um Vampire seu morre, pagando 2 de vida você compra uma carta, uma vez por Vampire',
  },
});
