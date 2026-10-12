// Biogenic Ooze
// When this creature enters, create a 2/2 green Ooze creature token.
// At the beginning of your end step, put a +1/+1 counter on each Ooze you control.
// {1}{G}{G}{G}: Create a 2/2 green Ooze creature token.
import { activated, addCounters, chars, controllerOf, createTokens, defineCard, etb, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Biogenic Ooze',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Ooze', 1); }, { text: 'Quando esta criatura entra, crie uma ficha de criatura Ooze 2/2 verde.' }),
      triggered(on.endStep('you'), function* (c) {
        for (const id of c.g.state.zones.battlefield.filter((x) => controllerOf(c.g, x) === c.you && chars(c.g, x).subtypes.includes('Ooze'))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'No início da sua etapa final, coloque um marcador +1/+1 em cada Ooze que você controla.' }),
      activated('{1}{G}{G}{G}', function* (c) { yield* createTokens(c.g, c.you, 'Ooze', 1); }, { text: '{1}{G}{G}{G}: Crie uma ficha de criatura Ooze 2/2 verde.' }),
    ],
  }],
  rulings: {},
});