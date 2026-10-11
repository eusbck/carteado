// Krosan Verge
// This land enters tapped.
// {T}: Add {C}.
// {2}, {T}, Sacrifice this land: Search your library for a Forest card and a Plains card, put them onto the
// battlefield tapped, then shuffle.
import { activated, chars, defineCard, land, mana, putOntoBattlefield, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Krosan Verge',
  faces: [{
    abilities: [
      land.tapped(),
      mana('C'),
      activated('{2}, {T}, Sacrifice this land', function* (c) {
        const tem = (id: number, tipo: string) => chars(c.g, id).subtypes.includes(tipo);
        // uma carta de Forest e outra de Plains (básicas ou não); uma carta com os dois tipos serve para um só
        const [floresta] = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => tem(id, 'Forest'), prompt: 'Krosan Verge: procure uma carta de Forest' });
        const [planicie] = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => id !== floresta && tem(id, 'Plains'), prompt: 'Krosan Verge: procure uma carta de Plains' });
        const achadas = [floresta, planicie].filter((x): x is number => x !== undefined);
        // as duas entram ao mesmo tempo
        if (achadas.length) yield* putOntoBattlefield(c.g, achadas.map((id) => ({ id, controller: c.you, tapped: true })), 'search');
        shuffleLibrary(c.g, c.you);
      }, { text: '{2}, {T}, Sacrifique este terreno: Procure uma carta de Forest e uma carta de Plains, coloque-as no campo viradas e embaralhe.' }),
    ],
  }],
  rulings: {},
});
