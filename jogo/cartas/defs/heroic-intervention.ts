// Heroic Intervention
// Permanents you control gain hexproof and indestructible until end of turn.
import { controlledBy, defineCard, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Heroic Intervention',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 3: o conjunto afetado é fixado na resolução (CR 611.2c)
        untilEndOfTurn(c, controlledBy(c.g, c.you, () => true), [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {
    1: 'não se aplica: não há batalhas nos decks (o motor não implementa batalhas)',
    2: 'regra geral: CR 704.5i — o planeswalker indestrutível perde marcadores de lealdade pelo dano e vai para o cemitério com 0 (motor/sba.ts)',
    3: 'teste: CR 611.2c: as permanentes que você passa a controlar depois da resolução não ganham nada',
  },
});
