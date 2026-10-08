// Leitmotif Composer
// Whenever this creature deals combat damage to a player, draw a card.
// Whenever you cast an instant or sorcery spell with mana value 5 or greater, create a token that's a copy of this
// creature.
// {2}{U}: Creatures named Leitmotif Composer can't be blocked this turn.
import { activated, and, copiableValues, createTokens, defineAbility, defineCard, draw, is, nameOf, on, ruleEffect, staticAbility, triggered } from '../../motor/api.ts';

const NOME = 'Leitmotif Composer';
// efeito de regra (não muda características): vale para toda criatura com esse nome, inclusive as que chegarem depois
const IMBLOQUEAVEL = defineAbility('Leitmotif Composer:imbloqueavel', staticAbility({
  rules: { canBeBlockedBy: (c, atacante) => nameOf(c.g, atacante) !== NOME },
  text: 'As criaturas chamadas Leitmotif Composer não podem ser bloqueadas neste turno.',
}));

export default defineCard({
  name: NOME,
  faces: [{
    abilities: [
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, compre uma carta.' }),
      // rulings 1, 5: valor de mana da mágica (X escolhido conta)
      triggered(on.youCast(and(is.instantOrSorcery, is.mvAtLeast(5))), function* (c) {
        // rulings 3, 4, 6: valores copiáveis (o que ela estiver copiando)
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, 1);
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço com valor de mana 5 ou mais, crie uma ficha que é cópia desta criatura.' }),
      activated('{2}{U}', function* (c) {
        ruleEffect(c, IMBLOQUEAVEL.id!, { kind: 'endOfTurn' });
      }, { text: '{2}{U}: As criaturas chamadas Leitmotif Composer não podem ser bloqueadas neste turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — na pilha, X usa o valor escolhido',
    2: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica',
    3: 'regra geral: CR 707.2 — copia o que a criatura estiver copiando',
    4: 'teste: a ficha cópia também cria cópias',
    5: 'regra geral: CR 202.3 — custos alternativos e reduções não mudam o valor de mana',
    6: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
  },
});
