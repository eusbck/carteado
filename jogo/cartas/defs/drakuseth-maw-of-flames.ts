// Drakuseth, Maw of Flames
// Flying
// Whenever Drakuseth attacks, Drakuseth deals 4 damage to any target and 3 damage to each of up to two other targets.
import { dealDamage, defineCard, keyword, on, t, tgtRef, triggered, upTo } from '../../motor/api.ts';
import type { TargetRef } from '../../motor/types.ts';

export default defineCard({
  name: 'Drakuseth, Maw of Flames',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        // CR 120.4: o dano a todos os alvos é causado ao mesmo tempo; ruling 1: atacando um planeswalker que morre,
        // Drakuseth continua atacando (CR 506.4)
        const danos: { source: number; target: TargetRef; amount: number; combat: boolean }[] = [];
        const primeiro = tgtRef(c, 0, 0);
        if (primeiro) danos.push({ source: c.source, target: primeiro, amount: 4, combat: false });
        for (let j = 0; j < 2; j++) {
          const outro = tgtRef(c, 1, j);
          if (outro) danos.push({ source: c.source, target: outro, amount: 3, combat: false });
        }
        if (danos.length) dealDamage(c.g, danos);
      }, {
        // ruling 2 / CR 115.3: os "outros alvos" não podem repetir o primeiro nem entre si
        targets: [t.any('qualquer alvo (4 de dano)'), { ...upTo(2, t.any('até dois outros alvos (3 de dano cada)')), differentFrom: [0] }],
        text: 'Sempre que Drakuseth ataca, ele causa 4 de dano a qualquer alvo e 3 de dano a cada um de até dois outros alvos.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: atacando um planeswalker que sai pelo dano, Drakuseth continua atacando',
    2: 'teste: o mesmo alvo não pode ser escolhido de novo',
  },
});
