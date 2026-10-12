// Royal Warden
// Phalanx Commander — When this creature enters, create two tapped 2/2 black Necron Warrior artifact creature tokens.
// Unearth {3}{B} ({3}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the
// beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { defineCard, etb, unearth } from '../../motor/api.ts';
import { DESENTERRAR, criaNecronWarriors } from '../necrons.ts';

export default defineCard({
  name: 'Royal Warden',
  faces: [{
    abilities: [
      etb(function* (c) { yield* criaNecronWarriors(c, 2, true); }, { text: 'Phalanx Commander — Quando esta criatura entra, crie duas fichas de criatura artefato Necron Warrior 2/2 pretas viradas.' }),
      unearth('{3}{B}'),
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