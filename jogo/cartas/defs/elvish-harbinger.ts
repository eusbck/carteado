// Elvish Harbinger
// When this creature enters, you may search your library for an Elf card, reveal it, then shuffle and put that card on
// top.
// {T}: Add one mana of any color.
import { defineCard, etb, isSubtype, mana, moveObjects, searchLibrary, shuffleLibrary, yesNo } from '../../motor/api.ts';
import { jog, obj, reg } from '../../motor/registro.ts';

export default defineCard({
  name: 'Elvish Harbinger',
  faces: [{
    abilities: [
      etb(function* (c) {
        const g = c.g;
        if (!(yield* yesNo(g, c.you, 'Elvish Harbinger: procurar uma carta de Elfo no seu grimório?'))) return;
        const [achada] = yield* searchLibrary(g, c.you, c.you, { max: 1, filter: (id) => isSubtype(g, id, 'Elf'), prompt: 'Elvish Harbinger: procure uma carta de Elfo' });
        if (achada !== undefined) reg(g, 'revela', { rule: '701.20' })`${jog(c.you)} revela ${obj(achada)}.`;
        shuffleLibrary(g, c.you);
        // "embaralhe e coloque essa carta no topo"
        if (achada !== undefined && g.state.objects[achada]?.zone === 'library') yield* moveObjects(g, [{ id: achada, to: 'library', position: 'top' }], 'search');
      }, { text: 'Quando esta criatura entra, você pode procurar uma carta de Elfo no seu grimório, revelá-la, depois embaralhar e colocar essa carta no topo.' }),
      mana('any'),
    ],
  }],
  rulings: {},
});
