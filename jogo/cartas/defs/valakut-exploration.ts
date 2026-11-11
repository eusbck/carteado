// Valakut Exploration
// Landfall — Whenever a land you control enters, exile the top card of your library. You may play that card for as long
// as it remains exiled.
// At the beginning of your end step, if there are cards exiled with this enchantment, put them into their owner's
// graveyard, then this enchantment deals that much damage to each opponent.
import { allowPlay, dealDamage, defineCard, exile, linkedExiled, moveObjects, on, triggered } from '../../motor/api.ts';

const CHAVE = 'valakut';

export default defineCard({
  name: 'Valakut Exploration',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo], { linkTo: { obj: c.source, key: CHAVE } });
        if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' });
      }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, exile a carta do topo do seu grimório. Você pode jogar essa carta enquanto ela permanecer exilada.' }),
      triggered(on.endStep('you'), function* (c) {
        const ids = linkedExiled(c.g, c.source, CHAVE);
        if (!ids.length) return;
        const foram = (yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'graveyard' as const })), 'effect')).filter((x) => x !== null).length;
        if (foram > 0) dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: foram, combat: false })));
      }, { condition: (c) => linkedExiled(c.g, c.source, CHAVE).length > 0, text: 'No início da sua etapa final, se houver cartas exiladas com este encantamento, coloque-as no cemitério do dono e depois este encantamento causa essa quantidade de dano a cada oponente.' }),
    ],
  }],
  rulings: {},
});
