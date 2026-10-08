// Volcanic Salvo
// This spell costs {X} less to cast, where X is the total power of creatures you control.
// Volcanic Salvo deals 6 damage to each of up to two target creatures and/or planeswalkers.
import { creaturesOf, dealDamage, defineCard, is, or, power, t, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Volcanic Salvo',
  faces: [{
    // rulings 2-6: só genérico; força negativa subtrai; total travado antes de pagar (CR 601.2f)
    selfCost: (c) => ({ reduce: Math.max(0, creaturesOf(c.g, c.you).reduce((s, id) => s + power(c.g, id), 0)) }),
    spell: {
      // ruling 1: dois alvos diferentes
      targets: [upTo(2, t.permanent(or(is.creature, is.planeswalker), 'até duas criaturas e/ou planeswalkers alvo'))],
      *effect(c) {
        const alvos = (c.targets[0] ?? []).filter((r): r is { kind: 'obj'; id: number } => !!r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield');
        dealDamage(c.g, alvos.map((r) => ({ source: c.source, target: r, amount: 6, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 115.3 — o mesmo alvo não pode ser escolhido duas vezes',
    2: 'teste: a redução não paga {R}{R}',
    3: 'teste: força negativa subtrai do total',
    4: 'regra geral: CR 601.2f — custo total; valor de mana não muda',
    5: 'regra geral: CR 601.2f — o total é travado antes de ativar habilidades de mana',
    6: 'regra geral: CR 601.2i — ninguém age no meio da conjuração',
  },
});
