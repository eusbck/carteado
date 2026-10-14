// Monstrous Onslaught
// Monstrous Onslaught deals X damage divided as you choose among any number of target creatures, where X is the greatest
// power among creatures you control as you cast this spell.
import { dealDamage, defineCard, t, tgtRef } from '../../motor/api.ts';
import { maiorForca } from '../dinossauros.ts';

export default defineCard({
  name: 'Monstrous Onslaught',
  faces: [{
    spell: {
      // CR 601.2d: X é visto ao dividir, durante a conjuração (ruling 2); pelo menos 1 de dano por alvo (ruling 1)
      targets: [{ ...t.creature(undefined, 'criaturas alvo do dano dividido'), min: 0, max: (c) => maiorForca(c.g, c.you) }],
      divide: (c) => maiorForca(c.g, c.you),
      *effect(c) {
        const div = c.division?.[0] ?? [];
        // ruling 3: a divisão não muda se algum alvo ficar ilegal; ruling 4: quem causa o dano é a mágica
        const golpes = (c.targets[0] ?? []).map((_, i) => ({ r: tgtRef(c, 0, i), n: div[i] ?? 0 })).filter((x) => x.r !== null && x.n > 0);
        if (golpes.length) dealDamage(c.g, golpes.map((x) => ({ source: c.source, target: x.r!, amount: x.n, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'teste: divide a maior força entre as criaturas alvo, com pelo menos 1 para cada',
    2: 'teste: X é a maior força ao conjurar, mesmo que ela mude antes de resolver',
    3: 'regra geral: CR 608.2b — o dano de um alvo ilegal não é causado nem redistribuído (motor/stack.ts)',
    4: 'teste: divide a maior força entre as criaturas alvo, com pelo menos 1 para cada',
  },
});
