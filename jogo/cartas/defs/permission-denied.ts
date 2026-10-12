// Permission Denied
// Counter target noncreature spell. Your opponents can't cast noncreature spells this turn.
import { chars, counter, defineCard, ruleEffect, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Permission Denied',
  faces: [{
    spell: {
      targets: [t.spell((c, id) => !chars(c.g, id).types.includes('Creature'), 'mágica alvo que não é de criatura')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* counter(c.g, id);
        // rulings 2 e 3: vale para todos os oponentes, mesmo que a mágica não tenha sido anulada
        ruleEffect(c, 'rule:cantCastNoncreature', { kind: 'endOfTurn' }, { players: c.g.opponents(c.you) });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o alvo ilegal a mágica não resolve e os oponentes continuam podendo conjurar (motor/stack.ts)',
    2: 'teste: anula a mágica que não é de criatura; os oponentes não conjuram mais mágicas que não são de criatura no turno',
    3: 'regra geral: CR 608.2c — a proibição vale mesmo que a mágica não possa ser anulada (cartas/defs/permission-denied.ts)',
  },
});