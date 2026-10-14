// Take the Bait
// Cast this spell only during combat on an opponent's turn.
// Prevent all combat damage that would be dealt to you and planeswalkers you control this turn. Untap all attacking
// creatures and goad them. After this phase, there is an additional combat phase.
import { addCombatPhaseAfterCurrent, controllerOf, defineAbility, defineCard, goad, isAttacking, isType, ruleEffect, untap } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

const COMBATE = ['beginCombat', 'declareAttackers', 'declareBlockers', 'firstStrikeDamage', 'combatDamage', 'endCombat'];

// CR 615.1a: o dano de combate a você e aos seus planeswalkers neste turno
const PREVINE = defineAbility<StaticDef>('Take the Bait:previne', {
  kind: 'static',
  rules: {
    preventsDamage: (c, alvo, _fonte, combate) => combate && (alvo.kind === 'player'
      ? alvo.id === c.you
      : !!c.g.state.objects[alvo.id] && isType(c.g, alvo.id, 'Planeswalker') && controllerOf(c.g, alvo.id) === c.you),
  },
});

export default defineCard({
  name: 'Take the Bait',
  faces: [{
    // CR 601.3: só durante o combate no turno de um oponente
    castOnlyIf: (c) => c.g.isOpponent(c.you, c.g.state.turn.active) && COMBATE.includes(c.g.state.turn.step),
    spell: {
      *effect(c) {
        ruleEffect(c, PREVINE.id!, { kind: 'endOfTurn' });
        // ruling 1: desvirar e goadar não tira as criaturas do combate
        const atacantes = c.g.state.zones.battlefield.filter((id) => isAttacking(c.g, id));
        for (const id of atacantes) { untap(c.g, id); goad(c.g, id, c.you); }
        // ruling 2: só um combate a mais, sem fase principal no meio (CR 500.8)
        addCombatPhaseAfterCurrent(c.g);
      },
    },
  }],
  rulings: {
    1: 'teste: no combate de Bruno: o dano a você é prevenido, os atacantes desviram goadados e há outro combate, em que precisam atacar Carla',
    2: 'regra geral: CR 500.8 — a fase de combate a mais vem logo depois desta, sem fase principal (motor/turn.ts addCombatPhaseAfterCurrent)',
  },
});
