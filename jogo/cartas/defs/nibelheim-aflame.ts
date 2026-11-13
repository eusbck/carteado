// Nibelheim Aflame
// Choose target creature you control. It deals damage equal to its power to each other creature. If this spell was
// cast from a graveyard, discard your hand and draw four cards.
// Flashback {5}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { allCreatures, dealDamage, defineCard, discard, draw, flashback, is, power, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Nibelheim Aflame',
  faces: [{
    // rulings 1-4, 6-7: retrospectiva (CR 702.34, motor/dsl.ts flashback)
    altCosts: [flashback('{5}{R}{R}')],
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        // ruling 8: com o alvo ilegal, a mágica não resolve (CR 608.2b)
        const id = tgt(c);
        if (id === null) return;
        // ruling 5: a força na resolução; ruling 9: a fonte do dano é a criatura
        const x = power(c.g, id) ?? 0;
        if (x > 0) {
          const outras = allCreatures(c.g).filter((o) => o !== id);
          if (outras.length) dealDamage(c.g, outras.map((o) => ({ source: id, target: { kind: 'obj' as const, id: o }, amount: x, combat: false })));
        }
        if (c.castFrom === 'graveyard') {
          yield* discard(c.g, c.you, c.g.state.zones.hand[c.you].length);
          yield* draw(c.g, c.you, 4);
        }
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — retrospectiva segue o tempo do tipo da carta (motor/priority.ts)',
    2: 'regra geral: CR 702.34a — paga a retrospectiva em vez do custo de mana e a carta é exilada ao sair da pilha (motor/stack.ts)',
    3: 'regra geral: CR 117.3 — o jogador ativo recebe prioridade primeiro (motor/priority.ts)',
    4: 'regra geral: CR 601.2f — custo total com aumentos e reduções; o valor de mana não muda (motor/stack.ts)',
    5: 'teste: a criatura alvo causa dano igual à força a cada outra criatura; da mão, não descarta',
    6: 'regra geral: CR 702.34a — vale mesmo para carta que foi ao cemitério sem ser conjurada (motor/priority.ts)',
    7: 'regra geral: CR 702.34a — a carta conjurada com retrospectiva é exilada (motor/stack.ts)',
    8: 'teste: com o alvo ilegal, não resolve e não descarta nem compra',
    9: 'teste: a fonte do dano é a criatura (proteção contra vermelho não impede o dano de uma criatura branca)',
  },
});
