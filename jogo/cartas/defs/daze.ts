// Daze
// You may return an Island you control to its owner's hand rather than pay this spell's mana cost.
// Counter target spell unless its controller pays {1}.
import { chars, counter, defineCard, mayPay, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Daze',
  faces: [{
    // custo alternativo (CR 118.9): devolver uma Island que você controla em vez do custo de mana
    altCosts: [{
      key: 'daze', label: 'Devolver uma Island que você controla à mão em vez de pagar o custo de mana', zone: 'hand', mana: '',
      parts: [{ k: 'returnPermanent', filter: (c, id) => chars(c.g, id).subtypes.includes('Island'), label: 'uma Island' }],
    }],
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const quem = c.g.state.objects[id].stack?.controller;
        // CR 118.12a: quem controla a mágica pode pagar {1}; se não pagar, ela é anulada
        if (quem !== undefined && !c.g.state.players[quem].left && (yield* mayPay(c, quem, '{1}', 'a mágica não ser anulada (Daze)'))) return;
        yield* counter(c.g, id);
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 601.2f, 202.3 — o custo total parte do custo alternativo; o valor de mana continua 2 (motor/stack.ts)' },
});
