// Hedge Shredder
// Whenever this Vehicle attacks, you may mill two cards.
// Whenever one or more land cards are put into your graveyard from your library, put them onto the battlefield tapped.
// Crew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { crew, defineCard, mill, on, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';
import { terrenosAoCemiterio } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Hedge Shredder',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        // ruling 1: com uma carta ou nenhuma no grimório, não pode escolher moer duas
        if (c.g.state.zones.library[c.you].length < 2) return;
        if (yield* yesNo(c.g, c.you, 'Hedge Shredder: moer duas cartas?')) yield* mill(c.g, c.you, 2);
      }, { text: 'Sempre que este Veículo ataca, você pode moer duas cartas.' }),
      // um disparo por lote; volta só quem ainda está no cemitério (CR 400.7)
      triggered(on.batch((evs, c) => {
        const ids = terrenosAoCemiterio(c.g, evs, c.you, 'library');
        return ids.length ? { terrenos: ids } : false;
      }), function* (c) {
        const ids = ((c.event as { terrenos?: number[] }).terrenos ?? []).filter((id) => c.g.state.objects[id]?.zone === 'graveyard');
        if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you, tapped: true })), 'effect');
      }, { text: 'Sempre que uma ou mais cartas de terreno são colocadas no seu cemitério vindas do seu grimório, coloque-as no campo viradas.' }),
      crew(1),
    ],
  }],
  rulings: { 1: 'teste: com uma carta só no grimório, não pergunta e não mói' },
});
