// Leyline Dowser
// {1}, {T}: Mill a card. You may put an instant or sorcery card milled this way into your hand.
// Tap an untapped legendary creature you control: Untap this artifact.
import { activated, defineCard, is, isLegendary, mill, moveObjects, nameOf, untap, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Leyline Dowser',
  faces: [{
    abilities: [
      activated('{1}, {T}', function* (c) {
        const [m] = yield* mill(c.g, c.you, 1);
        if (m === undefined || c.g.state.objects[m]?.zone !== 'graveyard' || !is.instantOrSorcery(c, m)) return;
        if (yield* yesNo(c.g, c.you, `Leyline Dowser: pôr ${nameOf(c.g, m)} na sua mão?`)) yield* moveObjects(c.g, [{ id: m, to: 'hand' }], 'effect');
      }, { text: '{1}, {T}: Moa uma carta. Você pode colocar na sua mão uma carta de instantânea ou de feitiço moída assim.' }),
      // ruling 1: vale virar uma criatura lendária que acabou de chegar (não é o símbolo {T} dela, CR 302.6)
      activated([{ k: 'tapCreatures', n: 1, filter: (c, id) => isLegendary(c.g, id), label: 'criatura lendária desvirada' }], function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untap(c.g, c.source);
      }, { text: 'Vire uma criatura lendária desvirada que você controla: Desvire este artefato.' }),
    ],
  }],
  rulings: {
    1: 'teste: virar uma criatura lendária com enjoo de invocação desvira o artefato',
  },
});
