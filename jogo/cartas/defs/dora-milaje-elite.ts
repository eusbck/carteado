// Dora Milaje Elite
// First strike
// When this creature enters, if an opponent controls more lands than you, create a tapped Vibranium token. (It's an
// artifact with indestructible and "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")
// Sacrifice this creature: Legendary permanents you control gain indestructible until end of turn.
import { activated, controlledBy, defineCard, etb, isLegendary, keyword, untilEndOfTurn } from '../../motor/api.ts';
import { oponenteComMaisTerrenos } from '../esquisitos.ts';
import { criaVibraniumVirado } from '../wakanda.ts';

export default defineCard({
  name: 'Dora Milaje Elite',
  faces: [{
    abilities: [
      keyword('first strike'),
      etb(function* (c) { yield* criaVibraniumVirado(c); }, {
        // CR 603.4: cláusula "se" interveniente
        condition: (c) => oponenteComMaisTerrenos(c.g, c.you),
        text: 'Quando esta criatura entra, se um oponente controla mais terrenos que você, crie uma ficha de Vibranium virada.',
      }),
      activated('Sacrifice this creature', function* (c) {
        // CR 611.2c: as permanentes lendárias que você controla na resolução
        const ids = controlledBy(c.g, c.you, (id) => isLegendary(c.g, id));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: 'Sacrifique esta criatura: As permanentes lendárias que você controla ganham indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: {},
});