// Bloodlord of Vaasgoth
// Bloodthirst 3 (If an opponent was dealt damage this turn, this creature enters with three +1/+1 counters on it.)
// Flying
// Whenever you cast a Vampire creature spell, it gains bloodthirst 3.
import { and, bloodthirst, defineCard, grantBloodthirstToSpell, is, keyword, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Bloodlord of Vaasgoth',
  faces: [{
    abilities: [
      // CR 702.54a
      bloodthirst(3),
      keyword('flying'),
      // ruling 1: soma com a sede de sangue impressa; rulings 2-3: só mágicas de criatura Vampire conjuradas
      triggered(on.youCast(and(is.creature, is.subtype('Vampire'))), function* (c) {
        grantBloodthirstToSpell(c, c.event.spell as ObjId, 3);
      }, { text: 'Sempre que você conjura uma mágica de criatura Vampire, ela ganha sede de sangue 3.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.54c — sedes de sangue somam (motor/criaturas.ts grantBloodthirstToSpell)',
    2: 'regra geral: CR 601.2 — só conta o que a mágica é ao ser conjurada, não o que a criatura vai copiar ao entrar',
    3: 'teste: Vampire posto no campo sem ser conjurado não ganha sede de sangue',
  },
});
