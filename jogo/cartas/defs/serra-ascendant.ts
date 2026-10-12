// Serra Ascendant
// Lifelink (Damage dealt by this creature also causes you to gain that much life.)
// As long as you have 30 or more life, this creature gets +5/+5 and has flying.
import { defineCard, keyword, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Serra Ascendant',
  faces: [{
    abilities: [
      keyword('lifelink'),
      selfGets((c) => (c.g.state.players[c.you].life >= 30 ? [{ k: 'pt', p: 5, t: 5 }, { k: 'addKeyword', kw: 'flying' }] : []), 'Enquanto você tiver 30 ou mais pontos de vida, esta criatura recebe +5/+5 e tem voar.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.3 — o bônus é aplicado antes de as ações de estado conferirem se o dano é letal (motor/sba.ts)',
    2: 'não se aplica: não há Gigante de Duas Cabeças nesta mesa',
  },
});