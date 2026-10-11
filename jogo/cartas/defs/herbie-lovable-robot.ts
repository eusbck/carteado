// H.E.R.B.I.E., Lovable Robot
// Flying
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, surveil 1.
// {T}: Add {C}.
// {1}, {T}: Add one mana of any color.
import { defineCard, keyword, lookAndArrange, mana } from '../../motor/api.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

export default defineCard({
  name: 'H.E.R.B.I.E., Lovable Robot',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 701.25: vigiar 1
      noCombateSeConjurou(function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, {
        text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, vigiar 1.',
      }),
      mana('C'),
      mana('any', { cost: '{1}, {T}', text: '{1}, {T}: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {},
});
