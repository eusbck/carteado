// Mayhem Devil
// Whenever a player sacrifices a permanent, this creature deals 1 damage to any target.
import { dealDamage, defineCard, on, t, tgtRef, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Mayhem Devil',
  faces: [{
    abilities: [
      // ruling 5: sacrificado ele mesmo, ainda dispara (olha para trás, CR 603.10a)
      triggered(on.custom((e) => e.type === 'sacrifice'), function* (c) {
        const alvo = tgtRef(c);
        if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: 1, combat: false }]);
      }, { targets: [t.any()], text: 'Sempre que um jogador sacrifica um permanente, esta criatura causa 1 ponto de dano a qualquer alvo.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.5j — a regra da lenda não sacrifica',
    2: 'teste: dispara quando um oponente sacrifica, e você escolhe o alvo',
    3: 'teste: sacrificado para pagar um custo, o gatilho resolve antes da habilidade',
    4: 'regra geral: o gatilho só reage a sacrifícios pedidos por outras mágicas, habilidades ou custos',
    5: 'teste: sacrificado ele mesmo, ainda dispara',
  },
});
