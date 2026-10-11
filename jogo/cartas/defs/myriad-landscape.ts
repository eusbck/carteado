// Myriad Landscape
// This land enters tapped.
// {T}: Add {C}.
// {2}, {T}, Sacrifice this land: Search your library for up to two basic land cards that share a land type, put them
// onto the battlefield tapped, then shuffle.
import { activated, chars, defineCard, isLand, land, mana, putOntoBattlefield, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Myriad Landscape',
  faces: [{
    abilities: [
      land.tapped(),
      mana('C'),
      activated('{2}, {T}, Sacrifice this land', function* (c) {
        const basico = (id: number) => isLand(c.g, id) && chars(c.g, id).supertypes.includes('Basic');
        // CR 205.3i: tipos de terreno (subtipos de terreno); a segunda precisa compartilhar um com a primeira
        const [primeira] = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: basico, prompt: 'Myriad Landscape: procure até dois terrenos básicos que compartilhem um tipo de terreno (o primeiro)' });
        let segunda: number | undefined;
        if (primeira !== undefined) {
          const tipos = chars(c.g, primeira).subtypes;
          // ruling 1: pode parar em um só
          [segunda] = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => id !== primeira && basico(id) && chars(c.g, id).subtypes.some((s) => tipos.includes(s)), prompt: 'Myriad Landscape: procure o segundo terreno básico (do mesmo tipo), se quiser' });
        }
        const achadas = [primeira, segunda].filter((x): x is number => x !== undefined);
        if (achadas.length) yield* putOntoBattlefield(c.g, achadas.map((id) => ({ id, controller: c.you, tapped: true })), 'search');
        shuffleLibrary(c.g, c.you);
      }, { text: '{2}, {T}, Sacrifique este terreno: Procure até duas cartas de terreno básico que compartilhem um tipo de terreno, coloque-as no campo viradas e embaralhe.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode buscar só um terreno básico',
  },
});
