// Hexmark Destroyer
// Multi-threat Eliminator — This creature can't be blocked except by six or more creatures.
// Unearth {4}{B}{B} ({4}{B}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the
// beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { defineCard, staticAbility, unearth } from '../../motor/api.ts';
import { DESENTERRAR } from '../necrons.ts';

export default defineCard({
  name: 'Hexmark Destroyer',
  faces: [{
    abilities: [
      staticAbility({ rules: { minBlockers: (c, atacante) => (atacante === c.source ? 6 : 0) }, text: 'Multi-threat Eliminator — Esta criatura não pode ser bloqueada exceto por seis ou mais criaturas.' }),
      unearth('{4}{B}{B}'),
    ],
  }],
  rulings: {
    1: DESENTERRAR.sumiu,
    2: DESENTERRAR.naoMagica,
    3: DESENTERRAR.sairia,
    4: DESENTERRAR.etapaFinal,
    5: DESENTERRAR.impeto,
  },
});