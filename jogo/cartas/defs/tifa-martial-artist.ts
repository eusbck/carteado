// Tifa, Martial Artist
// Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)
// Whenever one or more creatures you control with power 7 or greater deal combat damage to a player, untap all
// creatures you control. If it's the first combat phase of your turn, there is an additional combat phase after this
// phase.
import { addCombatPhaseAfterCurrent, controllerOf, creaturesOf, defineCard, isFirstCombat, melee, on, power, triggered, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Tifa, Martial Artist',
  faces: [{
    abilities: [
      melee(),
      // ruling 6: a força de cada criatura, não a soma
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'damage' && e.combat && e.target.kind === 'player'
        && controllerOf(c.g, e.source) === c.you && power(c.g, e.source) >= 7)), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) untap(c.g, id);
        // ruling 4: sem fase principal entre os combates
        if (c.g.state.turn.active === c.you && isFirstCombat(c.g)) addCombatPhaseAfterCurrent(c.g);
      }, { text: 'Sempre que uma ou mais criaturas que você controla com força 7 ou mais causam dano de combate a um jogador, desvire todas as criaturas que você controla. Se for a primeira fase de combate do seu turno, há uma fase de combate adicional depois desta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.121b — corpo a corpo conta os oponentes atacados, não as criaturas (motor/criaturas.ts melee)',
    2: 'regra geral: CR 702.121b — dispara atacando planeswalker ou batalha, mas só conta oponentes (motor/criaturas.ts melee)',
    3: 'regra geral: CR 508.4 — criatura que entra atacando não foi declarada e não conta (motor/criaturas.ts melee)',
    4: 'teste: força 7 causa dano: desvira suas criaturas e há um combate a mais',
    5: 'regra geral: CR 702.121b — o bônus é contado na resolução, pelos oponentes atacados (motor/criaturas.ts melee)',
    6: 'teste: força 7 causa dano: desvira suas criaturas e há um combate a mais',
  },
});
