// Silhana Ledgewalker
// Hexproof (This creature can't be the target of spells or abilities your opponents control.)
// This creature can't be blocked except by creatures with flying.
import { defineCard, hasKw, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Silhana Ledgewalker',
  faces: [{
    abilities: [
      keyword('hexproof'),
      // ruling 1: alcance não é voar
      staticAbility({
        rules: { canBeBlockedBy: (c, atacante, bloqueador) => atacante !== c.source || hasKw(c.g, bloqueador, 'flying') },
        text: 'Esta criatura não pode ser bloqueada, exceto por criaturas com voar.',
      }),
    ],
  }],
  rulings: { 1: 'teste: uma criatura com alcance não a bloqueia; uma com voar bloqueia' },
});
