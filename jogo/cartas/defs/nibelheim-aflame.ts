// Nibelheim Aflame
// Choose target creature you control. It deals damage equal to its power to each other creature. If this spell was
// cast from a graveyard, discard your hand and draw four cards.
// Flashback {5}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { dealDamage, defineCard, discard, draw, flashback, is, isCreature, power, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Nibelheim Aflame',
  faces: [{
    altCosts: [flashback('{5}{R}{R}')],
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        const fonte = tgt(c);
        if (fonte === null) return; // ruling 8
        // ruling 5: a força na resolução; ruling 9: a criatura é a fonte do dano
        const n = power(c.g, fonte);
        const outras = c.g.state.zones.battlefield.filter((id) => id !== fonte && isCreature(c.g, id));
        if (n > 0 && outras.length) dealDamage(c.g, outras.map((id) => ({ source: fonte, target: { kind: 'obj' as const, id }, amount: n, combat: false })));
        if (c.g.state.objects[c.source]?.stack?.castFrom === 'graveyard') {
          yield* discard(c.g, c.you, c.g.state.zones.hand[c.you].length);
          yield* draw(c.g, c.you, 4);
        }
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — retrospectiva segue o tempo do feitiço (motor/priority.ts)',
    2: 'regra geral: CR 702.34a (motor/dsl.ts flashback)',
    3: 'regra geral: CR 702.34a — pode conjurar assim que a carta chega ao cemitério, com prioridade (motor/priority.ts)',
    4: 'regra geral: CR 601.2f — custo total a partir da retrospectiva (motor/stack.ts)',
    5: 'teste: a criatura causa dano igual à força dela a cada outra criatura',
    6: 'regra geral: CR 702.34a — vale mesmo para carta que foi ao cemitério sem ser conjurada (motor/priority.ts)',
    7: 'regra geral: CR 702.34a — conjurada por retrospectiva vai para o exílio de qualquer jeito (motor/stack.ts exileAfter)',
    8: 'regra geral: CR 608.2b — alvo ilegal: não resolve (motor/stack.ts)',
    9: 'teste: a criatura causa dano igual à força dela a cada outra criatura',
  },
});
