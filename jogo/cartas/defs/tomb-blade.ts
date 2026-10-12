// Tomb Blade
// Flying
// Whenever this creature deals combat damage to a player, that player loses life equal to the number of creatures they
// control unless they sacrifice a creature of their choice.
// Unearth {6}{B}{B}
import { chooseItems, creaturesOf, defineCard, keyword, loseLife, nameOf, objItem, on, sacrifice, triggered, unearth, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { DESENTERRAR } from '../necrons.ts';

export default defineCard({
  name: 'Tomb Blade',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const p = c.event.player as PlayerId;
        const criaturas = creaturesOf(c.g, p);
        if (!criaturas.length) return;
        if (yield* yesNo(c.g, p, `Tomb Blade: sacrificar uma criatura para não perder ${criaturas.length} de vida?`)) {
          const [esc] = yield* chooseItems(c.g, p, 'Sacrifique uma criatura', criaturas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          const sacrificadas = yield* sacrifice(c.g, [Number(esc)]);
          if (sacrificadas.length) return;
        }
        loseLife(c.g, p, creaturesOf(c.g, p).length, c.source);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, esse jogador perde pontos de vida iguais ao número de criaturas que ele controla, a menos que sacrifique uma criatura à escolha dele.' }),
      unearth('{6}{B}{B}'),
    ],
  }],
  rulings: {
    1: DESENTERRAR.sumiu,
    2: DESENTERRAR.naoMagica,
    3: DESENTERRAR.sairia,
    4: DESENTERRAR.etapaFinal,
    5: DESENTERRAR.impeto,
  },
});