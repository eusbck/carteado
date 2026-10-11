// Seize the Day
// Untap target creature. After this main phase, there is an additional combat phase followed by an additional main
// phase.
// Flashback {2}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { addCombatPhaseAfterCurrent, defineCard, flashback, t, tgt, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Seize the Day',
  faces: [{
    altCosts: [flashback('{2}{R}')],
    spell: {
      targets: [t.creature()],
      *effect(c) {
        // ruling 7: com o alvo ilegal a mágica não resolve e não há combate adicional (CR 608.2b)
        const id = tgt(c);
        if (id === null) return;
        untap(c.g, id);
        // CR 500.8: combate adicional e, depois dele, uma fase principal adicional
        addCombatPhaseAfterCurrent(c.g, { thenMain: true });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — a permissão vale assim que a carta está no cemitério (motor/priority.ts)',
    2: 'regra geral: CR 601.2f — o custo de retrospectiva é o custo alternativo; aumentos e reduções se aplicam a ele (motor/stack.ts totalSpellCost)',
    3: 'teste: conjurada pela retrospectiva, vai para o exílio',
    4: 'regra geral: CR 702.34a — a retrospectiva vale para a carta no cemitério, tenha ela sido conjurada antes ou não',
    5: 'regra geral: CR 702.34a — custo alternativo e exílio ao sair da pilha (motor/dsl.ts flashback, motor/actions.ts exileOnLeave)',
    6: 'regra geral: CR 702.34a — segue as permissões de tempo do tipo da carta (motor/priority.ts)',
    7: 'teste: com o alvo ilegal, não há combate adicional',
    8: 'regra geral: CR 500.8 — as fases adicionais entram no turno em curso, logo depois da fase atual (motor/turn.ts addCombatPhaseAfterCurrent)',
    9: 'teste: conjurada pela retrospectiva, vai para o exílio',
  },
});
