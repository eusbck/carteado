// Heroic Intervention
// Permanents you control gain hexproof and indestructible until end of turn.
import { defineCard, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Heroic Intervention',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 3 / CR 611.2c: o conjunto de permanentes é fixado na resolução
        const ids = c.g.state.zones.battlefield.filter((id) => c.g.state.objects[id].controller === c.you);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {
    1: 'não se aplica: nenhuma batalha nos decks',
    2: 'regra geral: CR 704.5i — planeswalker indestrutível com 0 de lealdade vai para o cemitério (motor/sba.ts)',
    3: 'teste: ruling 3: permanentes que você passa a controlar depois não ganham nada',
  },
});
