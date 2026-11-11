// Heroic Intervention
// Permanents you control gain hexproof and indestructible until end of turn.
import { controlledBy, defineCard, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Heroic Intervention',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 3: as permanentes afetadas são fixadas na resolução (CR 611.2c)
        const ids = controlledBy(c.g, c.you, () => true);
        untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
      },
    },
  }],
  rulings: {
    1: 'não se aplica: nenhuma carta dos decks é uma batalha',
    2: 'regra geral: CR 704.5i — o planeswalker com 0 de lealdade vai para o cemitério mesmo indestrutível (motor/sba.ts)',
    3: 'teste: CR 611.2c — a permanente que entra depois da resolução não ganha nada',
  },
});
