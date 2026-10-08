// Chimil, the Inner Sun
// Spells you control can't be countered.
// At the beginning of your end step, discover 5.
import { defineCard, discover, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Chimil, the Inner Sun',
  faces: [{
    abilities: [
      staticAbility({ rules: { cantBeCountered: (c, spell) => c.g.state.objects[spell]?.stack?.controller === c.you }, text: 'As mágicas que você controla não podem ser anuladas.' }),
      triggered(on.endStep('you'), function* (c) { yield* discover(c.g, c.you, 5); }, { text: 'No início da sua etapa final, descubra 5.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mágica que anula ainda pode mirar, mas não anula',
    2: 'regra geral: só vale no campo (habilidade estática)',
  },
});
