// Tifa, Martial Artist
// Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)
// Whenever one or more creatures you control with power 7 or greater deal combat damage to a player, untap all
// creatures you control. If it's the first combat phase of your turn, there is an additional combat phase after this
// phase.
import { addCombatPhaseAfterCurrent, creaturesOf, defineCard, isFirstCombat, melee, power, triggered, untap } from '../../motor/api.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';

export default defineCard({
  name: 'Tifa, Martial Artist',
  faces: [{
    abilities: [
      // CR 702.121a; rulings 1-3 e 5: conta os oponentes atacados com criaturas declaradas, na resolução (motor/criaturas.ts)
      melee(),
      // ruling 6: a força de cada criatura, não a soma; um gatilho por jogador que tomou o dano
      triggered(seusCausamDanoDeCombate((c, id) => power(c.g, id) >= 7), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) untap(c.g, id);
        // ruling 4: só a fase de combate, sem fase principal adicional (CR 500.8)
        if (c.g.state.turn.active === c.you && isFirstCombat(c.g)) addCombatPhaseAfterCurrent(c.g);
      }, { text: 'Sempre que uma ou mais criaturas que você controla com força 7 ou mais causam dano de combate a um jogador, desvire todas as criaturas que você controla. Se for a primeira fase de combate do seu turno, há uma fase de combate adicional depois desta.' }),
    ],
  }],
  rulings: {
    1: 'teste: corpo a corpo conta cada oponente atacado, não quantas criaturas atacaram cada um',
    2: 'regra geral: CR 702.121a — atacar um planeswalker dispara, mas só jogadores atacados contam (motor/criaturas.ts gatilhoCorpoACorpo)',
    3: 'regra geral: CR 506.3 — criaturas que entram atacando não foram declaradas: não disparam nem contam (motor/criaturas.ts gatilhoCorpoACorpo)',
    4: 'teste: força 7 no dano a um jogador: desvira as suas criaturas e há um segundo combate, sem fase principal no meio',
    5: 'regra geral: CR 702.121a — o bônus é calculado na resolução, com os oponentes atacados mesmo que já tenham saído (motor/criaturas.ts gatilhoCorpoACorpo)',
    6: 'teste: conta a força de cada criatura, não a soma',
  },
});
