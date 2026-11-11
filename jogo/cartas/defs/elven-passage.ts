// Elven Passage
// {T}, Pay 1 life, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped,
// then shuffle. You may behold an Elf. If you do, untap that land.
import { activated, behold, defineCard, isSubtype, untap } from '../../motor/api.ts';
import { basico, buscaTerrenos } from '../terras.ts';

export default defineCard({
  name: 'Elven Passage',
  faces: [{
    abilities: [
      activated('{T}, Pay 1 life, Sacrifice this land', function* (c) {
        const [novo] = yield* buscaTerrenos(c, 1, (id) => basico(c.g, id), true, 'Procure uma carta de terreno básico');
        if (novo === undefined) return;
        const visto = yield* behold(c, (id) => isSubtype(c.g, id, 'Elf'), 'um Elf', { optional: true });
        if (visto) untap(c.g, novo);
      }, { text: '{T}, Pague 1 de vida, Sacrifique este terreno: Procure uma carta de terreno básico, coloque-a no campo virada e embaralhe. Você pode contemplar um Elf. Se fizer isso, desvire esse terreno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.4a — contemplar: escolher um Elf seu no campo ou revelar um da mão',
    2: 'regra geral: CR 608.2c — o terreno desvira depois de entrar virado',
    3: 'regra geral: CR 701.4 — contemplar é opcional',
  },
});
