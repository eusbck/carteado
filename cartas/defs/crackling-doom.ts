// Crackling Doom
// Crackling Doom deals 2 damage to each opponent. Each opponent sacrifices a creature with the greatest power
// among creatures that player controls.
import { chars, controlledBy, dealDamage, defineCard, eachSacrifices, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Crackling Doom',
  faces: [{
    spell: {
      *effect(c) {
        const opps = c.g.opponents(c.you);
        dealDamage(c.g, opps.map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2, combat: false })));
        // ruling 1: cada oponente escolhe em ordem APNAP, depois todos sacrificam juntos (CR 101.4)
        const greatest = (id: number) => {
          const p = chars(c.g, id).controller;
          const max = Math.max(...controlledBy(c.g, p, (x) => isCreature(c.g, x)).map((x) => chars(c.g, x).power ?? 0));
          return isCreature(c.g, id) && (chars(c.g, id).power ?? 0) === max;
        };
        yield* eachSacrifices(c, c.g.opponents(c.you), greatest, 1, 'uma criatura com a maior força');
      },
    },
  }],
  rulings: {
    1: 'teste: cada oponente sacrifica uma criatura de maior força; empates o jogador escolhe',
    2: 'teste: proteção não impede o sacrifício',
    3: 'regra geral: o sacrifício não depende do dano (instruções seguidas em ordem, CR 608.2c)',
    4: 'teste: cada oponente sacrifica uma criatura de maior força; empates o jogador escolhe',
  },
});
