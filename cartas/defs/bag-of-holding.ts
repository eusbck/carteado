// Bag of Holding — Whenever you discard a card, exile that card from your graveyard.
// {2}, {T}: Draw a card, then discard a card.
// {4}, {T}, Sacrifice this artifact: Return all cards exiled with this artifact to their owner's hand.
import { activated, defineCard, discard, draw, exile, lkiObj, moveObjects, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bag of Holding',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'discard' && e.player === c.you ? { card: e.obj } : false)), function* (c) {
        const id = c.event.card as number;
        const o = c.g.state.objects[id];
        // CR 603.6: só acha a carta se ainda estiver no cemitério
        if (o && o.zone === 'graveyard') yield* exile(c.g, [id], { linkTo: { obj: c.source, key: 'bag' } });
      }, { text: 'Sempre que você descarta uma carta, exile essa carta do seu cemitério.' }),
      activated('{2}, {T}', function* (c) {
        yield* draw(c.g, c.you, 1);
        yield* discard(c.g, c.you, 1);
      }, { text: '{2}, {T}: Compre uma carta, depois descarte uma carta.' }),
      activated('{4}, {T}, Sacrifice this artifact', function* (c) {
        // habilidades vinculadas (CR 607.2a): só as cartas exiladas por esta Bag
        const linked = lkiObj(c.g, c.source)?.linked.bag ?? [];
        const still = linked.filter((id) => c.g.state.objects[id]?.zone === 'exile');
        yield* moveObjects(c.g, still.map((id) => ({ id, to: 'hand' as const })), 'return');
      }, { text: '{4}, {T}, Sacrifique este artefato: Devolva para a mão do dono todas as cartas exiladas com ele.' }),
    ],
  }],
});
