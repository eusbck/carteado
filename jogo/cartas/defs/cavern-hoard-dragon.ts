// Cavern-Hoard Dragon
// This spell costs {X} less to cast, where X is the greatest number of artifacts an opponent controls.
// Flying, trample, haste
// Whenever this creature deals combat damage to a player, you create a Treasure token for each artifact that player
// controls.
import { controlledBy, createTokens, defineCard, isType, keywords, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

const artefatos = (g: G, p: PlayerId): number => controlledBy(g, p, (id) => isType(g, id, 'Artifact')).length;

export default defineCard({
  name: 'Cavern-Hoard Dragon',
  faces: [{
    // ruling 1: X é fixado ao conjurar; reduz só o genérico (CR 601.2f)
    selfCost: (c) => ({ reduce: c.g.opponents(c.you).reduce((m, p) => Math.max(m, artefatos(c.g, p)), 0) }),
    abilities: [
      ...keywords('flying', 'trample', 'haste'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        // contado na resolução
        const n = artefatos(c.g, c.event.player as PlayerId);
        if (n > 0) yield* createTokens(c.g, c.you, 'Treasure', n);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, você cria uma ficha de Treasure para cada artefato que esse jogador controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — a redução é calculada e travada ao determinar o custo total (motor/stack.ts totalSpellCost)',
    2: 'teste: custa {X} a menos, com X o maior número de artefatos de um oponente',
    3: 'regra geral: CR 601.2f — a redução só tira mana genérica; {R}{R} continua sendo pago',
    4: 'teste: causando dano de combate, cria um Treasure para cada artefato do jogador',
  },
});
