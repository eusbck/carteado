// Avacyn's Judgment
// Madness {X}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it
// into your graveyard.)
// Avacyn's Judgment deals 2 damage divided as you choose among any number of targets. If this spell's madness cost was
// paid, it deals X damage divided as you choose among those permanents and/or players instead.
import { dealDamage, defineCard, madness, t, tgtRef } from '../../motor/api.ts';
import type { G } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

/** o dano a dividir: X se o custo de loucura foi pago, senão 2 */
function dano(g: G, magica: ObjId, x: number): number {
  return g.state.objects[magica]?.stack?.method === 'madness' ? x : 2;
}

export default defineCard({
  name: "Avacyn's Judgment",
  faces: [{
    // CR 702.35: custo de loucura com X
    abilities: [madness('{X}{R}')],
    spell: {
      // ruling 11 (CR 601.2d): a divisão é anunciada ao conjurar e cada alvo recebe pelo menos 1
      targets: [{ ...t.any('alvos do dano dividido'), min: 0, max: (c) => dano(c.g, c.source, c.x ?? 0) }],
      divide: (c) => dano(c.g, c.source, c.x),
      *effect(c) {
        const div = c.division?.[0] ?? [];
        // ruling 10: os alvos que continuam legais recebem a parte que lhes coube
        const golpes = (c.targets[0] ?? []).map((_, i) => ({ r: tgtRef(c, 0, i), n: div[i] ?? 0 })).filter((x) => x.r !== null && x.n > 0);
        if (golpes.length) dealDamage(c.g, golpes.map((x) => ({ source: c.source, target: x.r!, amount: x.n, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.35a — descartada durante uma resolução, vai para o exílio e o gatilho vem depois (testes/regras-conjurar.test.ts)',
    2: 'teste: sem conjurar, vai para o cemitério',
    3: 'regra geral: CR 603.3 — o gatilho da loucura vai para a pilha acima da mágica paga com o descarte (testes/regras-conjurar.test.ts)',
    4: 'regra geral: CR 701.9a — só se descarta da mão (motor/actions.ts)',
    5: 'regra geral: CR 702.35a — vale para qualquer descarte (motor/actions.ts moveObjects)',
    6: 'regra geral: CR 702.35a — continua sendo descarte (testes/regras-conjurar.test.ts)',
    7: 'teste: conjurada pela loucura no turno de outro jogador, causa X de dano dividido',
    8: 'teste: conjurada pela loucura no turno de outro jogador, causa X de dano dividido',
    9: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
    10: 'regra geral: CR 608.2b — os alvos que continuam legais recebem a divisão original (motor/stack.ts)',
    11: 'teste: conjurada da mão, causa 2 de dano dividido entre os alvos escolhidos',
  },
});
