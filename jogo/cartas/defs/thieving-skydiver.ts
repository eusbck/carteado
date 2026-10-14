// Thieving Skydiver
// Kicker {X}. X can't be 0. (You may pay an additional {X} as you cast this spell.)
// Flying
// When this creature enters, if it was kicked, gain control of target artifact with mana value X or less. If that
// artifact is an Equipment, attach it to this creature.
import { additionalCost, and, attach, chars, defineCard, gainControl, is, isSubtype, keyword, manaValue, on, paidTimes, t, tgt, triggered } from '../../motor/api.ts';
import { manaOptions } from '../../motor/costs.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

/** o X pago no kicker: o da mágica na pilha ou o do permanente que ela virou (CR 702.33d) */
function xDoKicker(c: SCtx, id: ObjId): number {
  const o = c.g.state.objects[id] ?? c.g.state.lki[id]?.obj;
  if (!o || paidTimes(c.g, id, 'kicker') === 0) return 0;
  return o.stack?.x ?? (o.data.spell as { x?: number } | undefined)?.x ?? 0;
}

export default defineCard({
  name: 'Thieving Skydiver',
  faces: [{
    // Kicker {X} (CR 702.33): o {X} entra no custo total; o X não faz parte do custo de mana (valor de mana 2).
    // "X não pode ser 0": pago com X = 0, nada muda no custo e a habilidade não dispara (o mesmo que não pagar)
    additionalCosts: [additionalCost('kicker', 'kicker {X}', [], { optional: true })],
    selfCost: (c, info) => {
      const o = c.g.state.objects[c.source];
      return o?.stack?.paid.kicker && info.x > 0 ? { add: `{${info.x}}` } : {};
    },
    spell: {
      // o X só é escolhido com o kicker pago, até o que a mana disponível talvez pague além do {1}{U}
      xMax: (c) => {
        if (!c.g.state.objects[c.source]?.stack?.paid.kicker) return 0;
        const porFonte = new Map<number, number>();
        for (const o of manaOptions(c.g, c.you)) porFonte.set(o.obj, Math.max(porFonte.get(o.obj) ?? 0, o.alt.length));
        const total = c.g.state.players[c.you].manaPool.length + [...porFonte.values()].reduce((a, b) => a + b, 0);
        return Math.max(0, total - 2);
      },
    },
    abilities: [
      keyword('flying'),
      triggered(on.selfEnters(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        gainControl(c.g, id, c.you, { kind: 'permanent' }, c.source);
        // se for Equipamento, fica preso a esta criatura (ruling 9: se ela saiu, o Equipamento fica onde estava)
        if (isSubtype(c.g, id, 'Equipment') && c.g.state.objects[c.source]?.zone === 'battlefield' && chars(c.g, c.source).types.includes('Creature')) attach(c.g, id, c.source);
      }, {
        // CR 603.4: "se foi reforçada" é condição interveniente
        condition: (c) => xDoKicker(c, c.source) > 0,
        targets: [t.artifact(and(is.artifact, (c, id) => manaValue(c.g, id) <= xDoKicker(c, c.source)), 'artefato alvo com valor de mana X ou menos')],
        text: 'Quando esta criatura entra, se foi reforçada, ganhe o controle do artefato alvo com valor de mana X ou menos. Se esse artefato for um Equipamento, anexe-o a esta criatura.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: reforçada com X = 2, custa {1}{U} + {2} e o valor de mana continua 2',
    2: 'teste: posta no campo sem ser conjurada, não foi reforçada e não rouba nada',
    3: 'regra geral: CR 707.10 — a cópia da mágica copia o kicker pago (motor/stack.ts copySpell)',
    4: 'regra geral: CR 702.33d — a cópia de um permanente não fica reforçada',
    5: 'regra geral: CR 702.33d — com o custo pago, a mágica está reforçada',
    6: 'regra geral: CR 702.33c — o kicker se paga uma vez só (motor/stack.ts)',
    7: 'teste: pode mirar um artefato seu; se for Equipamento, é anexado a ela',
    8: 'teste: ganha o controle de um artefato com valor de mana até X, e o controle não acaba',
    9: 'regra geral: CR 701.3b — se ela já saiu do campo, o Equipamento não é anexado (motor/actions.ts attach)',
  },
});
