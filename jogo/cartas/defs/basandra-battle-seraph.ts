// Basandra, Battle Seraph
// Flying
// Players can't cast spells during combat.
// {R}: Target creature attacks this turn if able.
import { activated, defineCard, keyword, staticAbility, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

const COMBATE = new Set(['beginCombat', 'declareAttackers', 'declareBlockers', 'firstStrikeDamage', 'combatDamage', 'endCombat']);

export default defineCard({
  name: 'Basandra, Battle Seraph',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-2: nenhuma mágica na fase de combate, nem com lampejo; as habilidades continuam podendo ser ativadas
      staticAbility({ rules: { cantCastSpells: (c) => COMBATE.has(c.g.state.turn.step) }, text: 'Os jogadores não podem conjurar mágicas durante o combate.' }),
      activated('{R}', function* (c) {
        const id = tgt(c);
        // ruling 3: a exigência segue as regras de sempre para atacar
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:attacksIfAble' }]);
      }, { targets: [t.creature()], text: '{R}: A criatura alvo ataca neste turno se puder.' }),
    ],
  }],
  rulings: {
    1: 'teste: durante o combate ninguém conjura mágicas, nem instantâneas',
    2: 'teste: as habilidades continuam podendo ser ativadas durante o combate',
    3: 'teste: {R}: a criatura alvo ataca neste turno se puder',
  },
});