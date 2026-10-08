// Aurelia, the Warleader
// Flying, vigilance, haste
// Whenever Aurelia attacks for the first time each turn, untap all creatures you control. After this phase, there is an
// additional combat phase.
import { addCombatPhaseAfterCurrent, creaturesOf, defineCard, keywords, on, triggered, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Aurelia, the Warleader',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance', 'haste'),
      triggered(on.selfAttacks(), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) untap(c.g, id);
        // ruling 1: só uma fase de combate a mais, sem fase principal no meio (CR 500.8)
        addCombatPhaseAfterCurrent(c.g);
      }, { oncePerTurn: true, text: 'Sempre que Aurelia ataca pela primeira vez a cada turno, desvire todas as criaturas que você controla. Depois desta fase, há uma fase de combate adicional.' }),
    ],
  }],
  rulings: { 1: 'teste: a fase de combate adicional vem logo depois, sem fase principal' },
});
