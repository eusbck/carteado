// Akroma, Angel of Fury
// This spell can't be countered.
// Flying, trample, protection from white and from blue
// {R}: Akroma gets +1/+0 until end of turn.
// Morph {3}{R}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn her face up any time for her
// morph cost.)
import { activated, defineCard, keyword, morph, protectionFrom, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Akroma, Angel of Fury',
  faces: [{
    // ruling 1: virada para baixo a mágica não tem texto e pode ser anulada (faceDefOf: CR 708.2a)
    cantBeCountered: true,
    abilities: [
      keyword('flying'),
      keyword('trample'),
      protectionFrom('W'),
      protectionFrom('U'),
      activated('{R}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 1, t: 0 }]);
      }, { text: '{R}: Akroma recebe +1/+0 até o fim do turno.' }),
      // CR 702.37: conjurada virada para baixo por {3}; vira para cima pagando {3}{R}{R}{R} (ação especial)
      morph('{3}{R}{R}{R}'),
    ],
  }],
  rulings: {
    1: 'teste: virada para baixo, a mágica pode ser anulada',
    2: 'teste: virada para cima, a anulação não a anula',
    3: 'teste: como comandante, conjura virada para baixo da zona de comando pagando {3} mais o imposto',
  },
});
