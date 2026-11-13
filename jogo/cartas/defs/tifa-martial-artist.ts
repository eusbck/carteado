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
      // rulings 1-3, 5: corpo a corpo (CR 702.121, motor/criaturas.ts)
      melee(),
      // ruling 6: cada criatura com força 7 ou mais por si; o dano de combate de uma etapa chega num lote
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'damage' && e.combat && e.target.kind === 'player'
        && !!c.g.state.objects[e.source] && controllerOf(c.g, e.source) === c.you && (power(c.g, e.source) ?? 0) >= 7)), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) untap(c.g, id);
        // ruling 4: só a fase de combate, sem fase principal a mais
        if (c.g.state.turn.active === c.you && isFirstCombat(c.g)) addCombatPhaseAfterCurrent(c.g);
      }, { text: 'Sempre que uma ou mais criaturas que você controla com força 7 ou mais causam dano de combate a um jogador, desvire todas as criaturas que você controla. Se for a primeira fase de combate do seu turno, há uma fase de combate adicional depois desta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.121a — conta os oponentes atacados, não as criaturas (motor/criaturas.ts melee)',
    2: 'regra geral: CR 702.121a — dispara atacando planeswalker, mas só conta oponentes (motor/criaturas.ts melee)',
    3: 'regra geral: CR 508.3a — criatura que entra atacando não foi declarada atacante e não conta (motor/criaturas.ts melee)',
    4: 'teste: com força 7 ou mais no primeiro combate, desvira as criaturas e há um combate adicional, sem fase principal no meio',
    5: 'regra geral: CR 702.121a — o bônus é contado na resolução (motor/criaturas.ts melee)',
    6: 'teste: a força de cada criatura conta sozinha; duas de força 4 não disparam',
  },
});
