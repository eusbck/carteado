// Predators' Hour
// Until end of turn, creatures you control gain menace and "Whenever this creature deals combat damage to a player, exile
// the top card of that player's library face down. You may look at and play that card for as long as it remains exiled,
// and you may spend mana as though it were mana of any color to cast that spell."
import { allowPlay, creaturesOf, defineAbility, defineCard, moveObjects, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const SAQUE = defineAbility("Predators' Hour:saque", triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
  const s = c.g.state;
  const p = c.event.player as PlayerId;
  const topo = s.zones.library[p][0];
  if (topo === undefined) return;
  // virada para baixo; só você pode olhá-la (CR 406.3)
  const [ex] = yield* moveObjects(c.g, [{ id: topo, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile');
  if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return;
  // ruling 1: joga no tempo normal, pagando os custos; a mana pode ser gasta como se fosse de qualquer cor
  allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { anyType: true });
}, { text: 'Sempre que esta criatura causa dano de combate a um jogador, exile a carta do topo do grimório desse jogador virada para baixo. Você pode olhar e jogar essa carta enquanto ela continuar exilada, e pode gastar mana como se fosse de qualquer cor para conjurá-la.' }));

export default defineCard({
  name: "Predators' Hour",
  faces: [{
    spell: {
      *effect(c) {
        // só as criaturas que você controla na resolução (CR 611.2c)
        const ids = creaturesOf(c.g, c.you);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'menace' }, { k: 'addAbility', id: SAQUE.id! }]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.3, 305.1 — a carta exilada é jogada no tempo normal, pagando os custos (motor/priority.ts rule:mayPlay)',
  },
});
