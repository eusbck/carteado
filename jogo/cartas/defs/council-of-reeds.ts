// Council of Reeds
// The "legend rule" doesn't apply to creatures you control.
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a token that's a copy of
// Council of Reeds.
import { copiableValues, createTokens, defineCard, staticAbility } from '../../motor/api.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

export default defineCard({
  name: 'Council of Reeds',
  faces: [{
    abilities: [
      // CR 704.5j. O motor isenta todos os permanentes lendários do jogador; nos decks só há criaturas lendárias repetidas por esta carta
      staticAbility({ rules: { legendRuleExempt: (c, player) => player === c.you }, text: 'A "regra das lendas" não se aplica às criaturas que você controla.' }),
      // CR 707.2: a ficha copia os valores copiáveis; se Council of Reeds saiu do campo, usa a última informação conhecida
      noCombateSeConjurou(function* (c) { yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, 1); }, {
        text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, crie uma ficha que é uma cópia de Council of Reeds.',
      }),
    ],
  }],
  rulings: {},
});
