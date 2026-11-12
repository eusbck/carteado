// Mothdust Changeling
// Changeling (This card is every creature type.)
// Tap an untapped creature you control: This creature gains flying until end of turn.
import { activated, changeling, defineCard, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Mothdust Changeling',
  faces: [{
    abilities: [
      changeling(),
      // ruling 1: virar uma criatura é custo, não o símbolo {T}: vale até ela mesma com enjoo de invocação (CR 302.6)
      activated([{ k: 'tapCreatures', n: 1, includeSelf: true, label: 'uma criatura desvirada que você controla' }], function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'flying' }]);
      }, { text: 'Vire uma criatura desvirada que você controla: Esta criatura ganha voar até o fim do turno.' }),
    ],
  }],
  rulings: { 1: 'teste: virando a si mesma com enjoo de invocação, ganha voar' },
});
