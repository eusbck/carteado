// Batroc the Leaper
// Multikicker {2} (You may pay an additional {2} any number of times as you cast this spell.)
// Batroc enters with a +1/+1 counter on him for each time he was kicked.
// When Batroc enters, he deals damage equal to his power to each of up to X targets, where X is the number of times he
// was kicked.
import { dealDamage, defineCard, entersWithCounters, etb, kickedTimes, multikicker, power, t, tgtRef } from '../../motor/api.ts';
import type { TargetRef } from '../../motor/types.ts';

export default defineCard({
  name: 'Batroc the Leaper',
  faces: [{
    // CR 702.33c: custo adicional que pode ser pago quantas vezes quiser
    additionalCosts: [multikicker('{2}')],
    abilities: [
      // CR 702.33d: só a mágica conjurada foi reforçada
      entersWithCounters('+1/+1', (_c, ev) => Number(ev.spell?.paid.multikicker ?? 0)),
      etb(function* (c) {
        const alvos = (c.targets[0] ?? []).map((_, i) => tgtRef(c, 0, i)).filter((r): r is TargetRef => r !== null);
        // a força é a de Batroc na resolução (ou a última que ele teve, se já saiu do campo)
        const n = c.g.state.objects[c.source] ? power(c.g, c.source) : (c.g.state.lki[c.source]?.chars.power ?? 0);
        if (alvos.length && n > 0) dealDamage(c.g, alvos.map((target) => ({ source: c.source, target, amount: n, combat: false })));
      }, {
        targets: [{ ...t.any('até X alvos (X é o número de vezes que Batroc foi reforçado)'), min: 0, max: (c) => kickedTimes(c.g, c.source) }],
        text: 'Quando Batroc entra, ele causa dano igual à força dele a cada um de até X alvos, onde X é o número de vezes que ele foi reforçado.',
      }),
    ],
  }],
  rulings: {},
});
