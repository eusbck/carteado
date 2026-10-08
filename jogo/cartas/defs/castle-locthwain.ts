// Castle Locthwain
// This land enters tapped unless you control a Swamp.
// {T}: Add {B}.
// {1}{B}{B}, {T}: Draw a card, then you lose life equal to the number of cards in your hand.
import { activated, defineCard, draw, land, loseLife, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Castle Locthwain',
  faces: [{
    abilities: [
      land.tappedUnlessControl('Swamp'),
      mana('B'),
      activated('{1}{B}{B}, {T}', function* (c) {
        yield* draw(c.g, c.you, 1);
        // ruling 1: conta a mão logo depois de comprar, na mesma resolução (CR 608.2h)
        loseLife(c.g, c.you, c.g.state.zones.hand[c.you].length, c.source);
      }, { text: '{1}{B}{B}, {T}: Compre uma carta e depois você perde vida igual ao número de cartas na sua mão.' }),
    ],
  }],
  rulings: {
    1: 'teste: compra e perde vida igual às cartas na mão, sem janela entre as duas coisas',
    2: 'não se aplica: fala dos terrenos comuns do ciclo (Mystic Sanctuary etc.), não deste',
    3: 'não se aplica: fala dos terrenos comuns do ciclo, que têm tipo básico; este não tem',
  },
});
