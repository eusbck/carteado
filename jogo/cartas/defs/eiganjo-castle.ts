// Eiganjo Castle
// {T}: Add {W}.
// {W}, {T}: Prevent the next 2 damage that would be dealt to target legendary creature this turn.
import { activated, defineCard, is, mana, ruleEffect, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Eiganjo Castle',
  faces: [{
    abilities: [
      mana('W'),
      // escudo de prevenção: gasta-se conforme o dano chega (motor/actions.ts, rule:preventNextDamageTo)
      activated('{W}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) ruleEffect(c, 'rule:preventNextDamageTo', { kind: 'endOfTurn' }, { params: { to: id, left: 2 } });
      }, { targets: [t.creature(is.legendary, 'criatura lendária alvo')], text: '{W}, {T}: Previna os próximos 2 de dano que seriam causados à criatura lendária alvo neste turno.' }),
    ],
  }],
  rulings: {},
});