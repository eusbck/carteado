// Dread Return
// Return target creature card from your graveyard to the battlefield.
// Flashback—Sacrifice three creatures. (You may cast this card from your graveyard for its flashback cost. Then exile
// it.)
import { chars, defineCard, flashback, isCreature, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Dread Return',
  faces: [{
    altCosts: [flashback('', [{ k: 'sacrifice', n: 3, label: 'criaturas', filter: (c, id) => isCreature(c.g, id) }])],
    spell: {
      targets: [t.card('graveyard', (c, id) => chars(c.g, id).types.includes('Creature'), 'carta de criatura alvo no seu cemitério')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect'); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2c — o alvo é escolhido antes de pagar os custos: não dá para devolver uma das criaturas sacrificadas (motor/stack.ts)',
    2: 'teste: recapitular sacrificando três criaturas: conjurada do cemitério e depois exilada',
    3: 'regra geral: CR 702.34a — recapitular segue o tempo normal do tipo da carta: feitiço só quando se pode conjurar feitiço (motor/dsl.ts flashback)',
    4: 'regra geral: CR 601.2f — o custo total parte do custo alternativo; o valor de mana vem só do custo de mana (motor/stack.ts)',
    5: 'regra geral: CR 702.34a — conjurada por recapitular, é exilada ao sair da pilha, resolva ou não (motor/dsl.ts flashback)',
    6: 'regra geral: CR 702.34a — vale mesmo que a carta tenha ido ao cemitério sem ter sido conjurada (motor/dsl.ts flashback)',
    7: 'regra geral: CR 117.3b — indo ao cemitério no seu turno, você recebe prioridade primeiro e pode conjurá-la antes dos outros (motor/priority.ts)',
  },
});