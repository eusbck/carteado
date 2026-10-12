// Force of Will
// You may pay 1 life and exile a blue card from your hand rather than pay this spell's mana cost.
// Counter target spell.
import { chars, counter, defineCard, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Force of Will',
  faces: [{
    // custo alternativo (CR 118.9): 1 de vida e exilar uma carta azul da mão
    altCosts: [{
      key: 'forca', label: 'pagando 1 de vida e exilando uma carta azul da mão', zone: 'hand', mana: '',
      parts: [{ k: 'life', n: 1 }, { k: 'exileFromHand', n: 1, label: 'carta azul', filter: (c, id) => chars(c.g, id).colors.includes('U') }],
    }],
    spell: {
      targets: [t.spell()],
      *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
    },
  }],
  rulings: { 1: 'regra geral: CR 601.2f — o custo total parte do custo alternativo; o valor de mana continua 5 (motor/stack.ts)' },
});