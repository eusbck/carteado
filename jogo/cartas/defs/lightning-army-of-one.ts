// Lightning, Army of One
// First strike, trample, lifelink
// Stagger — Whenever Lightning deals combat damage to a player, until your next turn, if a source would deal damage to
// that player or a permanent that player controls, it deals double that damage instead.
import { controllerOf, defineAbility, defineCard, keywords, on, ruleEffect, triggered } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

// CR 614.1a: substituição "causa o dobro desse dano em vez disso"; vale para qualquer fonte (ruling 3: a fonte é a mesma)
const DOBRO = defineAbility<StaticDef>('Lightning, Army of One:dobro', {
  kind: 'static',
  rules: {
    damageDouble: (c, _fonte, alvo) => {
      const jogador = (c as SCtx & { params?: { jogador: PlayerId } }).params?.jogador;
      if (jogador === undefined) return false;
      if (alvo.kind === 'player') return alvo.id === jogador;
      return !!c.g.state.objects[alvo.id] && controllerOf(c.g, alvo.id) === jogador;
    },
  },
});

export default defineCard({
  name: 'Lightning, Army of One',
  faces: [{
    abilities: [
      ...keywords('first strike', 'trample', 'lifelink'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const jogador = c.event.player as PlayerId;
        ruleEffect(c, DOBRO.id!, { kind: 'untilYourNextTurn', player: c.you, sinceTurn: c.g.state.turn.number }, { params: { jogador } });
      }, { text: 'Cambalear — Sempre que Lightning causa dano de combate a um jogador, até o seu próximo turno, se uma fonte fosse causar dano a esse jogador ou a uma permanente que ele controla, ela causa o dobro desse dano em vez disso.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 616.1 — com prevenção e dobro juntos, o afetado escolhe a ordem; o motor dobra antes de prevenir (motor/actions.ts dealDamage)',
    2: 'teste: o dano é dividido antes de dobrar (atropelar: o excedente ao jogador também dobra)',
    3: 'regra geral: CR 120.3 — o dano dobrado é da mesma fonte (motor/actions.ts dealDamage)',
  },
});
