// Ant-Man, Elusive Avenger
// Ant-Man can't be blocked by creatures with greater power.
// Whenever Ant-Man deals combat damage to a player, create that many Treasure tokens.
import { createTokens, defineCard, on, power, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ant-Man, Elusive Avenger',
  faces: [{
    abilities: [
      staticAbility({
        rules: { canBeBlockedBy: (c, atacante, bloqueador) => atacante !== c.source || power(c.g, bloqueador) <= power(c.g, atacante) },
        text: 'Ant-Man não pode ser bloqueado por criaturas com força maior.',
      }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const n = Number(c.event.amount ?? 0);
        if (n > 0) yield* createTokens(c.g, c.you, 'Treasure', n);
      }, { text: 'Sempre que Ant-Man causa dano de combate a um jogador, crie essa quantidade de fichas Treasure.' }),
    ],
  }],
  rulings: {},
});