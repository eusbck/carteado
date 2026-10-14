// Scurry of Squirrels
// Myriad, myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token
// that's a copy of this creature that's tapped and attacking that player or a planeswalker they control. Then do it
// again. Exile the tokens at end of combat.)
// Whenever this creature deals combat damage to a player, put a +1/+1 counter on target creature you control.
import { addCounters, defineCard, is, myriad, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Scurry of Squirrels',
  faces: [{
    abilities: [
      // duas instâncias de miríade, cada uma dispara separadamente (CR 702.116b)
      myriad(),
      myriad(),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Sempre que esta criatura causa dano de combate a um jogador, coloque um marcador +1/+1 na criatura alvo que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 506.2 — o jogador defensor é o atacado pela criatura com miríade (motor/mecanicas.ts MYRIAD)',
    2: 'teste: com um oponente só, a miríade não cria fichas',
    3: 'regra geral: CR 702.116a — cada ficha ataca o jogador ou um planeswalker dele, à escolha (motor/mecanicas.ts MYRIAD)',
    4: 'regra geral: CR 508.4 — as fichas entram atacando sem terem sido declaradas: "sempre que ataca" não dispara',
    5: 'regra geral: CR 702.116a — as fichas de uma miríade entram ao mesmo tempo',
    6: 'regra geral: CR 707.2 — as fichas copiam só os valores copiáveis',
    7: 'regra geral: CR 707.5 — as habilidades de entrar da criatura copiada funcionam',
    8: 'regra geral: CR 616.1 — o motor pergunta separadamente para cada ficha a mais',
  },
});
