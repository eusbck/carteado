// Claim Jumper
// Vigilance
// When this creature enters, if an opponent controls more lands than you, you may search your library for a Plains card
// and put it onto the battlefield tapped. Then if an opponent controls more lands than you, repeat this process once. If
// you search your library this way, shuffle.
import { defineCard, etb, isSubtype, keyword, searchTo, yesNo } from '../../motor/api.ts';
import { oponenteComMaisTerrenos } from '../esquisitos.ts';

export default defineCard({
  name: 'Claim Jumper',
  faces: [{
    abilities: [
      keyword('vigilance'),
      // ruling 2: cláusula "se" interveniente (CR 603.4); ruling 1: depois da primeira Plains, confere de novo e repete uma vez
      etb(function* (c) {
        for (let i = 0; i < 2; i++) {
          if (!oponenteComMaisTerrenos(c.g, c.you)) break;
          if (!(yield* yesNo(c.g, c.you, 'Claim Jumper: procurar uma carta de Plains no seu grimório e colocá-la no campo virada?'))) break;
          yield* searchTo(c, c.you, (id) => isSubtype(c.g, id, 'Plains'), 1, 'battlefield', { tapped: true, prompt: 'Claim Jumper: escolha uma carta de Plains' });
        }
      }, { condition: (c) => oponenteComMaisTerrenos(c.g, c.you), text: 'Quando esta criatura entra, se um oponente controla mais terrenos que você, você pode procurar no seu grimório uma carta de Plains e colocá-la no campo de batalha virada. Depois, se um oponente controla mais terrenos que você, repita esse processo uma vez. Se você procurou no seu grimório assim, embaralhe.' }),
    ],
  }],
  rulings: {
    1: 'teste: busca uma Plains virada e, se um oponente ainda tem mais terrenos, repete uma vez',
    2: 'teste: sem oponente com mais terrenos, não dispara',
  },
});
