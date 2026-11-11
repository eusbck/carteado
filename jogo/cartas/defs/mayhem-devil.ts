// Mayhem Devil
// Whenever a player sacrifices a permanent, this creature deals 1 damage to any target.
import { dealDamage, defineCard, on, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Mayhem Devil',
  faces: [{
    abilities: [triggered(on.custom((e) => e.type === 'sacrifice'), function* (c) {
      const alvo = c.targets[0]?.[0];
      if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: 1, combat: false }]);
    }, { targets: [t.any()], text: 'Sempre que um jogador sacrifica um permanente, esta criatura causa 1 de dano a qualquer alvo.' })],
  }],
  rulings: {
    1: 'regra geral: CR 701.21a — dispara pelo sacrifício de qualquer jogador, inclusive ao pagar custos (Treasure)',
    2: 'regra geral: CR 603.2 — cada permanente sacrificado dispara uma vez',
    3: 'regra geral: CR 603.10a — dispara mesmo se ela própria for sacrificada',
    4: 'regra geral: CR 120.3 — o dano é causado pela criatura',
    5: 'regra geral: CR 701.21a — destruir não é sacrificar',
  },
});
