// Cyberdrive Awakener
// Flying
// Other artifact creatures you control have flying.
// When this creature enters, each noncreature artifact you control becomes a 4/4 artifact creature until end of turn.
import { and, anthem, controlledBy, defineCard, etb, is, isCreature, isType, keyword, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Cyberdrive Awakener',
  faces: [{
    abilities: [
      keyword('flying'),
      anthem(and(is.creature, is.artifact, is.yours, is.other), () => [{ k: 'addKeyword', kw: 'flying' }], 'As outras criaturas artefato que você controla têm voar.'),
      // CR 611.2c: o conjunto é travado na resolução
      etb(function* (c) {
        const artefatos = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact') && !isCreature(c.g, id));
        untilEndOfTurn(c, artefatos, [{ k: 'addTypes', types: ['Artifact', 'Creature'] }, { k: 'setPT', p: 4, t: 4 }]);
      }, { text: 'Quando esta criatura entra, cada artefato que não é criatura que você controla se torna uma criatura artefato 4/4 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});

