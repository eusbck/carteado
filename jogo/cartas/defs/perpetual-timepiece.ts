// Perpetual Timepiece
// {T}: Mill two cards.
// {2}, Exile this artifact: Shuffle any number of target cards from your graveyard into your library.
import { activated, anyNumber, defineCard, mill, moveObjects, shuffleLibrary, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: 'Perpetual Timepiece',
  faces: [{
    abilities: [
      activated('{T}', function* (c) { yield* mill(c.g, c.you, 2); }, { text: '{T}: Moa duas cartas.' }),
      activated('{2}, Exile this artifact', function* (c) {
        const ids = tgtsAll(c, 0);
        if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'library' as const })), 'shuffle');
        shuffleLibrary(c.g, c.you);
      }, {
        targets: [anyNumber(t.card('graveyard', undefined, 'cartas alvo do seu cemitério'))],
        text: '{2}, Exile este artefato: Embaralhe qualquer número de cartas alvo do seu cemitério no seu grimório.',
      }),
    ],
  }],
  rulings: { 1: 'teste: sem alvos, só embaralha' },
});
