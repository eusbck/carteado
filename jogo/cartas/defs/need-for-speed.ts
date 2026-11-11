// Need for Speed
// Sacrifice a land: Target creature gains haste until end of turn.
import { activated, defineCard, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { sacrificaTerrenoCusto } from '../terras.ts';

export default defineCard({
  name: 'Need for Speed',
  faces: [{
    abilities: [activated([sacrificaTerrenoCusto], function* (c) {
      const id = tgt(c);
      if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'haste' }]);
    }, { targets: [t.creature()], text: 'Sacrifique um terreno: A criatura alvo ganha ímpeto até o fim do turno.' })],
  }],
  rulings: {},
});
