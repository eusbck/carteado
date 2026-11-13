// Moon-Blessed Cleric
// Divine Intervention — When this creature enters, you may search your library for an enchantment card, reveal it, then
// shuffle and put that card on top.
import { defineCard, etb, isType, moveObjects, searchLibrary, shuffleLibrary, yesNo } from '../../motor/api.ts';
import { jog, obj, reg } from '../../motor/registro.ts';

export default defineCard({
  name: 'Moon-Blessed Cleric',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Moon-Blessed Cleric: procurar uma carta de encantamento no seu grimório?'))) return;
        const achadas = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => isType(c.g, id, 'Enchantment'), prompt: 'Procure uma carta de encantamento' });
        if (achadas.length) reg(c.g, 'revela', { rule: '701.20' })`${jog(c.you)} revela ${obj(achadas[0])}.`;
        // embaralhar e pôr a carta no topo (como Enlightened Tutor)
        shuffleLibrary(c.g, c.you);
        if (achadas.length && c.g.state.objects[achadas[0]]?.zone === 'library') yield* moveObjects(c.g, [{ id: achadas[0], to: 'library', position: 'top' }], 'effect');
      }, { text: 'Intervenção Divina — Quando esta criatura entra, você pode procurar no seu grimório uma carta de encantamento, revelá-la, depois embaralhar e colocá-la no topo.' }),
    ],
  }],
  rulings: {},
});
