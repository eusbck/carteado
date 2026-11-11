// Hedge Shredder
// Whenever this Vehicle attacks, you may mill two cards.
// Whenever one or more land cards are put into your graveyard from your library, put them onto the battlefield tapped.
// Crew 1
import { crew, defineCard, mill, on, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { terrenosVaoParaSeuCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Hedge Shredder',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) { if (yield* yesNo(c.g, c.you, 'Hedge Shredder: moer duas cartas?')) yield* mill(c.g, c.you, 2); }, { text: 'Sempre que este Veículo ataca, você pode moer duas cartas.' }),
      triggered(terrenosVaoParaSeuCemiterio('library'), function* (c) {
        const ids = (c.event.cartas as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'graveyard');
        if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you, tapped: true })), 'effect');
      }, { text: 'Sempre que uma ou mais cartas de terreno são colocadas no seu cemitério vindas do seu grimório, coloque-as no campo de batalha viradas.' }),
      crew(1),
    ],
  }],
  rulings: { 1: 'regra geral: CR 603.2 — vale para moer de qualquer fonte, não só deste Veículo' },
});
