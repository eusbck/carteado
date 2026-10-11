// Hellkite Charger
// Flying, haste
// Whenever this creature attacks, you may pay {5}{R}{R}. If you do, untap all attacking creatures and after this phase,
// there is an additional combat phase.
import { addCombatPhaseAfterCurrent, defineCard, keywords, mayPay, on, triggered, untapAttackers } from '../../motor/api.ts';

export default defineCard({
  name: 'Hellkite Charger',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      triggered(on.selfAttacks(), function* (c) {
        // ruling 1: decide e paga na resolução
        if (!(yield* mayPay(c, c.you, '{5}{R}{R}', 'desvirar as criaturas atacantes e ter uma fase de combate adicional'))) return;
        // ruling 4: as atacantes desviram agora, na resolução, não quando o novo combate começa
        untapAttackers(c.g);
        // ruling 2 (CR 500.8): o novo combate vem logo depois deste, sem fase principal no meio
        addCombatPhaseAfterCurrent(c.g);
      }, { text: 'Sempre que esta criatura ataca, você pode pagar {5}{R}{R}. Se fizer isso, desvire todas as criaturas atacantes e, depois desta fase, há uma fase de combate adicional.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem pagar, não desvira nem há combate adicional',
    2: 'teste: pagando, desvira as atacantes e o combate adicional vem logo depois, sem fase principal',
    3: 'teste: no combate adicional o gatilho dispara de novo e pode criar mais um combate',
    4: 'teste: pagando, desvira as atacantes e o combate adicional vem logo depois, sem fase principal',
  },
});
