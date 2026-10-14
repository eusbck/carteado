// Castle Ardenvale
// This land enters tapped unless you control a Plains.
// {T}: Add {W}.
// {2}{W}{W}, {T}: Create a 1/1 white Human creature token.
import { activated, createTokens, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Castle Ardenvale',
  faces: [{
    abilities: [
      land.tappedUnlessControl('Plains'),
      mana('W'),
      activated('{2}{W}{W}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Human', 1); }, { text: '{2}{W}{W}, {T}: Crie uma ficha de criatura Human branca 1/1.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: fala dos terrenos comuns (Mystic Sanctuary), não deste',
    2: 'não se aplica: fala dos tipos básicos dos terrenos comuns; este não tem tipo de terreno',
  },
});
