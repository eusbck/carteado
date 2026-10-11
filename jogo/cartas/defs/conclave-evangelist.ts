// Conclave Evangelist
// Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy
// that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)
// Whenever this creature deals combat damage to a player, create a token that's a copy of this creature.
import { copiableValues, createTokens, defineCard, myriad, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Conclave Evangelist',
  faces: [{
    abilities: [
      // CR 702.116a
      myriad(),
      // ruling 9: a ficha criada aqui não é uma das fichas da miríade e não é exilada no fim do combate
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha que é uma cópia desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.116a, 506.2 — o jogador defensor é quem a criatura ataca (motor/mecanicas.ts MYRIAD)',
    2: 'teste: com um oponente só, a miríade não cria fichas; o dano de combate cria uma cópia que fica',
    3: 'regra geral: CR 702.116a — escolhe o jogador ou um planeswalker dele ao criar a ficha (motor/mecanicas.ts MYRIAD)',
    4: 'regra geral: CR 508.4 — as fichas entram atacando sem terem sido declaradas atacantes: a miríade delas não dispara (motor/actions.ts putOntoBattlefield)',
    5: 'regra geral: CR 702.116a — as fichas da mesma miríade entram ao mesmo tempo (motor/mecanicas.ts MYRIAD)',
    6: 'regra geral: CR 707.2 — a ficha copia só os valores copiáveis (motor/mecanicas.ts copiableValues)',
    7: 'não se aplica: Conclave Evangelist não tem habilidade de entrar',
    8: 'não se aplica: nenhum deck da mesa dobra as fichas da miríade',
    9: 'teste: com três jogadores, a cópia da miríade é exilada no fim do combate, e as cópias criadas pelo dano ficam',
  },
});