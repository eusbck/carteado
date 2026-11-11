// Cloud's Limit Break
// Tiered (Choose one additional cost.)
// • Cross-Slash — {0} — Destroy target tapped creature.
// • Blade Beam — {1} — Destroy any number of target tapped creatures with different controllers.
// • Omnislash — {3}{W} — Destroy all tapped creatures.
import { allCreatures, anyNumber, controllerOf, defineCard, destroy, is, modal, t, tgt, tgtsAll, tiered } from '../../motor/api.ts';

const VIRADA = t.creature(is.tapped, 'criatura virada alvo');

export default defineCard({
  name: "Cloud's Limit Break",
  faces: [{
    // CR 702.183a: escalonado — escolha um modo e pague, como custo adicional, o custo dele
    additionalCosts: tiered(['{0}', '{1}', '{3}{W}']),
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Corte Cruzado — {0} — Destrua a criatura virada alvo',
          targets: [VIRADA],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
        {
          text: 'Raio da Lâmina — {1} — Destrua qualquer número de criaturas viradas alvo com controladores diferentes',
          targets: [{
            ...anyNumber(VIRADA), label: 'criaturas viradas alvo com controladores diferentes',
            // CR 115.3: a restrição vale ao escolher os alvos; na resolução, cada alvo ainda legal é destruído
            validateSet: (c, escolhidos) => {
              const donos = escolhidos.map((r) => (r.kind === 'obj' ? controllerOf(c.g, r.id) : -1));
              return new Set(donos).size === donos.length;
            },
          }],
          *effect(c) {
            const ids = tgtsAll(c, 0);
            if (ids.length) yield* destroy(c.g, ids);
          },
        },
        {
          text: 'Omnicorte — {3}{W} — Destrua todas as criaturas viradas',
          *effect(c) {
            const ids = allCreatures(c.g).filter((id) => c.g.state.objects[id].tapped);
            if (ids.length) yield* destroy(c.g, ids);
          },
        },
      ]),
      *effect() { /* o modo faz tudo */ },
    },
  }],
  rulings: {
    1: 'teste: conjurada sem pagar o custo de mana, ainda paga o custo do modo escolhido',
    2: 'regra geral: CR 601.2b, 700.2 — o modo é escolhido ao conjurar e não muda (motor/stack.ts chooseModes)',
    3: 'teste: o modo com alvo só pode ser escolhido se houver uma criatura virada; os outros não exigem alvo',
    4: 'teste: o valor de mana continua 2, qualquer que seja o modo',
    5: 'teste: cada modo cobra o próprio custo adicional: Corte Cruzado {0}, Raio da Lâmina {1}, Omnicorte {3}{W}',
    6: 'regra geral: CR 707.10 — a cópia mantém o modo; pode escolher novos alvos (motor/stack.ts)',
  },
});
