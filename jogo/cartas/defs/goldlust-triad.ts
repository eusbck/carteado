// Goldlust Triad
// Flying
// Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy
// that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)
// Whenever this creature deals combat damage to a player, create a Treasure token.
import { createTokens, defineCard, keyword, myriad, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Goldlust Triad',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 702.116a
      myriad(),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha de Treasure.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.116a, 506.2 — o jogador defensor é quem a criatura ataca (motor/mecanicas.ts MYRIAD)',
    2: 'teste: com um oponente só, a miríade não cria fichas',
    3: 'regra geral: CR 702.116a — escolhe o jogador ou um planeswalker dele ao criar a ficha (motor/mecanicas.ts MYRIAD)',
    4: 'teste: miríade cria uma cópia atacando cada outro oponente; as cópias causam dano, criam Treasure e são exiladas no fim do combate',
    5: 'regra geral: CR 702.116a — as fichas da mesma miríade entram ao mesmo tempo (motor/mecanicas.ts MYRIAD)',
    6: 'regra geral: CR 707.2 — a ficha copia só os valores copiáveis (motor/mecanicas.ts copiableValues)',
    7: 'não se aplica: Goldlust Triad não tem habilidade de entrar',
    8: 'não se aplica: nenhum deck da mesa dobra as fichas da miríade',
  },
});
