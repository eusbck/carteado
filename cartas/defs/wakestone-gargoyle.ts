// Wakestone Gargoyle
// Defender, flying
// {1}{W}: Creatures you control with defender can attack this turn as though they didn't have defender.
import { activated, controllerOf, defineAbility, defineCard, keywords, ruleEffect, staticAbility } from '../../motor/api.ts';

// rulings 1-2: vale para as criaturas com defensor que você controlar no ataque, inclusive as que chegarem depois
const PODE_ATACAR = defineAbility('Wakestone Gargoyle:ataca', staticAbility({
  rules: {
    // o contexto do efeito de regra é o controlador de quem ativou
    canAttackWithDefender: (c, criatura) => controllerOf(c.g, criatura) === c.you,
  },
  text: 'Neste turno, as criaturas com defensor que você controla podem atacar como se não tivessem defensor.',
}));

export default defineCard({
  name: 'Wakestone Gargoyle',
  faces: [{
    abilities: [
      ...keywords('defender', 'flying'),
      activated('{1}{W}', function* (c) {
        ruleEffect(c, PODE_ATACAR.id!, { kind: 'endOfTurn' });
      }, { text: '{1}{W}: As criaturas com defensor que você controla podem atacar neste turno como se não tivessem defensor.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 611.3a — efeito de regra: vale para quem chegar depois (enjoo de invocação continua valendo)',
    2: 'teste: a própria Gargoyle e as outras com defensor podem atacar',
  },
});
