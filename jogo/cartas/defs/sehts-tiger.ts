// Seht's Tiger
// Flash (You may cast this spell any time you could cast an instant.)
// When this creature enters, you gain protection from the color of your choice until end of turn. (You can't be targeted,
// dealt damage, or enchanted by anything of the chosen color.)
import { chooseColor, defineCard, etb, keyword, ruleEffect } from '../../motor/api.ts';

export default defineCard({
  name: "Seht's Tiger",
  faces: [{
    abilities: [
      keyword('flash'),
      // a cor é escolhida na resolução; a proteção é do jogador (CR 702.16b, 702.16e)
      etb(function* (c) {
        const cor = yield* chooseColor(c.g, c.you, "Seht's Tiger: você ganha proteção contra qual cor?");
        ruleEffect(c, 'rule:playerProtection', { kind: 'endOfTurn' }, { players: [c.you], params: { quality: `color:${cor}` } });
      }, { text: 'Quando esta criatura entra, você ganha proteção contra a cor da sua escolha até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
