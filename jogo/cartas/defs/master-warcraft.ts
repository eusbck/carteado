// Master Warcraft
// Cast this spell only before attackers are declared.
// You choose which creatures attack this turn.
// You choose which creatures block this turn and how those creatures block.
import { defineCard, ruleEffect } from '../../motor/api.ts';

export default defineCard({
  name: 'Master Warcraft',
  faces: [{
    // ruling 1: só antes da etapa de declarar atacantes da primeira fase de combate do turno
    castOnlyIf: (c) => {
      const t = c.g.state.turn;
      return t.combatCount === 0 || (t.combatCount === 1 && t.step === 'beginCombat');
    },
    spell: {
      *effect(c) {
        // rulings 3-4: as decisões de ataque e de bloqueio deste turno passam a ser suas, de quem for o turno e de quem
        // forem as criaturas; as escolhas continuam tendo de ser legais (motor/combat.ts combatChooser)
        ruleEffect(c, 'rule:combatChooser', { kind: 'endOfTurn' }, { params: { player: c.you } });
        c.g.log(`${c.g.state.players[c.you].name} escolhe quais criaturas atacam e bloqueiam neste turno.`);
      },
    },
  }],
  rulings: {
    1: 'teste: só pode ser conjurada antes de os atacantes serem declarados',
    2: 'regra geral: CR 508.1 — quem conjurou escolhe as atacantes e o que cada uma ataca (simplificação: inclui os planeswalkers; motor/combat.ts declareAttackers)',
    3: 'teste: no seu turno, você escolhe os bloqueios do oponente',
    4: 'teste: no turno do oponente, você escolhe quais criaturas dele atacam',
  },
});