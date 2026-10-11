// Syrix, Carrier of the Flame
// Flying, haste
// At the beginning of each end step, if a creature card left your graveyard this turn, target Phoenix you control deals
// damage equal to its power to any target.
// Whenever another Phoenix you control dies, you may cast this card from your graveyard.
import { and, castSpell, dealDamage, defineCard, is, keywords, on, power, t, tgt, tgtRef, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Syrix, Carrier of the Flame',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      triggered(on.endStep('each'), function* (c) {
        const fenix = tgt(c, 0);
        const alvo = tgtRef(c, 1);
        if (fenix === null || alvo === null) return;
        // ruling 1: o dano é igual à força da Phoenix alvo
        const n = power(c.g, fenix);
        if (n > 0) dealDamage(c.g, [{ source: fenix, target: alvo, amount: n, combat: false }]);
      }, {
        // CR 603.4: cláusula "se" interveniente
        condition: (c) => (c.g.state.turnStats[c.you]?.creatureCardsLeftGraveyard ?? 0) > 0,
        targets: [t.permanent(and(is.yours, is.subtype('Phoenix')), 'Phoenix alvo que você controla'), t.any()],
        text: 'No início de cada etapa final, se uma carta de criatura saiu do seu cemitério neste turno, a Phoenix alvo que você controla causa dano igual à força dela a qualquer alvo.',
      }),
      // ruling 2: Syrix precisa já estar no cemitério quando a outra Phoenix morre (não vale morrer junto)
      triggered(on.batch((evs, c) => {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return false;
        if (evs.some((e) => e.type === 'zone' && e.obj === c.source)) return false;
        return evs.some((e) => {
          if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard' || e.controller !== c.you) return false;
          const l = c.g.state.lki[e.old];
          return !!l && l.chars.types.includes('Creature') && l.chars.subtypes.includes('Phoenix');
        });
      }), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(c.g, c.you, 'Syrix: conjurar do seu cemitério agora? (você paga o custo)'))) return;
        // ruling 3: conjurada durante a resolução, pagando todos os custos
        yield* castSpell(c.g, c.you, c.source, { key: 'syrix', label: 'conjurar do cemitério', zone: 'graveyard', duringResolution: true });
      }, { zones: ['graveyard'], text: 'Sempre que outra Phoenix que você controla morre, você pode conjurar esta carta do seu cemitério.' }),
    ],
  }],
  rulings: {
    1: 'teste: se uma carta de criatura saiu do seu cemitério no turno, na etapa final a Phoenix alvo causa dano igual à força dela',
    2: 'teste: morrendo junto com a outra Phoenix, não dispara',
    3: 'teste: no cemitério, quando outra Phoenix sua morre, pode ser conjurada na hora pagando o custo',
  },
});
