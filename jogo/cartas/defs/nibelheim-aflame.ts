// Nibelheim Aflame
// Choose target creature you control. It deals damage equal to its power to each other creature. If this spell was cast
// from a graveyard, discard your hand and draw four cards.
// Flashback {5}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { allCreatures, dealDamage, defineCard, discard, draw, flashback, is, power, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Nibelheim Aflame',
  faces: [{
    // CR 702.34a: retrospectiva — conjura do cemitério pelo custo de retrospectiva e depois vai para o exílio
    altCosts: [flashback('{5}{R}{R}')],
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        // ruling 8: com o alvo ilegal a mágica nem resolve (CR 608.2b), então nada abaixo acontece
        const alvo = tgt(c);
        if (alvo === null) return;
        // ruling 5: a força é a da resolução; ruling 9: a criatura é a fonte do dano, não a mágica
        const n = Math.max(0, power(c.g, alvo));
        const outras = allCreatures(c.g).filter((id) => id !== alvo);
        if (n > 0 && outras.length) dealDamage(c.g, outras.map((id) => ({ source: alvo, target: { kind: 'obj' as const, id }, amount: n, combat: false })));
        // "se esta mágica foi conjurada de um cemitério": a cópia não foi conjurada (castFrom vazio)
        if (c.g.state.objects[c.source]?.stack?.castFrom === 'graveyard') {
          const mao = c.g.state.zones.hand[c.you].length;
          if (mao) yield* discard(c.g, c.you, mao);
          yield* draw(c.g, c.you, 4);
        }
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — retrospectiva respeita o tempo de feitiço (motor/priority.ts)',
    2: 'teste: conjurada do cemitério por retrospectiva, descarta a mão, compra quatro e vai para o exílio',
    3: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
    4: 'regra geral: CR 601.2f — custo total; o valor de mana é o do custo impresso',
    5: 'teste: a criatura alvo causa dano igual à força dela na resolução a cada outra criatura, inclusive as suas',
    6: 'regra geral: CR 702.34a — não precisa ter sido conjurada antes',
    7: 'teste: se a criatura alvo fica ilegal, nada acontece, nem o descarte e a compra',
    8: 'teste: se a criatura alvo fica ilegal, nada acontece, nem o descarte e a compra',
    9: 'teste: a criatura é a fonte do dano: uma criatura branca causa dano a uma criatura com proteção contra vermelho',
  },
});
