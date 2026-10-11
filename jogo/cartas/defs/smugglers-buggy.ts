// Smuggler's Buggy
// Hideaway 4 (When this artifact enters, look at the top four cards of your library, exile one face down, then put the
// rest on the bottom in a random order.)
// Whenever this Vehicle deals combat damage to a player, you may cast the exiled card without paying its mana cost. If
// you do, return this Vehicle to its owner's hand.
// Crew 2
import { crew, defineCard, hideaway, linkedExiled, mayCastFree, nameOf, on, returnToHand, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Smuggler's Buggy",
  faces: [{
    abilities: [
      // CR 702.75a
      hideaway(4),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const [carta] = linkedExiled(c.g, c.source, 'hideaway');
        if (carta === undefined) return;
        // só mágica: um terreno escondido não pode ser conjurado
        const conjurou = yield* mayCastFree(c.g, c.you, carta, `Smuggler's Buggy: conjurar ${nameOf(c.g, carta)} sem pagar o custo de mana? (o veículo volta para a mão do dono)`);
        if (conjurou && c.g.state.objects[c.source]?.zone === 'battlefield') yield* returnToHand(c.g, [c.source]);
      }, { text: 'Sempre que este Veículo causa dano de combate a um jogador, você pode conjurar a carta exilada sem pagar o custo de mana. Se fizer isso, devolva este Veículo para a mão do dono.' }),
      // CR 702.122a
      crew(2),
    ],
  }],
  rulings: {
    1: 'teste: esconderijo 4 ao entrar; tripulado, causa dano de combate e conjura de graça a carta escondida, voltando para a mão',
    2: 'regra geral: CR 702.75a — quem controla o permanente pode olhar a carta escondida (motor/criaturas.ts hideaway)',
    3: 'não se aplica: Smuggler\'s Buggy não tem "entra virado"',
    4: 'regra geral: CR 702.75a — o resto vai para o fundo em ordem aleatória (testes/regras-criaturas.test.ts)',
  },
});
