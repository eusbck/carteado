// Elspeth, Sun's Champion
// +1: Create three 1/1 white Soldier creature tokens.
// −3: Destroy all creatures with power 4 or greater.
// −7: You get an emblem with "Creatures you control get +2/+2 and have flying."
import {
  activated, allCreatures, controllerOf, createEmblem, createTokens, defineCard, defineEmblem, destroy, isCreature, power,
  staticAbility,
} from '../../motor/api.ts';

// CR 114: o emblema fica na zona de comando, é de quem o recebe e a habilidade funciona de lá (114.2, 114.4)
const EMBLEMA = "Elspeth, Sun's Champion (emblema)";
defineEmblem({
  id: EMBLEMA,
  name: 'Emblema de Elspeth',
  abilities: [staticAbility({
    affects: (c, o) => isCreature(c.g, o.id) && controllerOf(c.g, o.id) === c.you,
    mods: () => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'flying' }],
    text: 'As criaturas que você controla recebem +2/+2 e têm voar.',
  })],
});

export default defineCard({
  name: "Elspeth, Sun's Champion",
  faces: [{
    abilities: [
      activated('+1', function* (c) {
        yield* createTokens(c.g, c.you, 'Soldier', 3);
      }, { text: '+1: Crie três fichas de criatura Soldier brancas 1/1.' }),
      activated('−3', function* (c) {
        // a força é a de quando a habilidade resolve (CR 608.2h); indestrutível fica (CR 702.12b)
        yield* destroy(c.g, allCreatures(c.g).filter((id) => power(c.g, id) >= 4));
      }, { text: '−3: Destrua todas as criaturas com força 4 ou mais.' }),
      activated('−7', function* (c) {
        createEmblem(c.g, c.you, EMBLEMA);
      }, { text: '−7: Você recebe um emblema com "As criaturas que você controla recebem +2/+2 e têm voar."' }),
    ],
  }],
  rulings: {},
});
