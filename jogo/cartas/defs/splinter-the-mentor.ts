// Splinter, the Mentor
// Menace
// Whenever Splinter or another nontoken creature you control leaves the battlefield, create a Mutagen token.
// Partner—Character select
import { createTokens, defineCard, keyword, triggered } from '../../motor/api.ts';
import { MUTAGEN, SELECAO, saiEuOuOutraCriaturaSua } from '../tartarugas.ts';

export default defineCard({
  name: 'Splinter, the Mentor',
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(saiEuOuOutraCriaturaSua(), function* (c) { yield* createTokens(c.g, c.you, 'Mutagen', 1); }, { text: 'Sempre que Splinter ou outra criatura que não é ficha que você controla sai do campo, crie uma ficha Mutagen.' }),
    ],
  }],
  rulings: {
    1: SELECAO.controla,
    2: MUTAGEN.alvos,
    3: MUTAGEN.predefinida,
    4: SELECAO.perder,
    5: SELECAO.dois,
    6: SELECAO.identidade,
    7: SELECAO.comecam,
    8: SELECAO.separados,
    9: SELECAO.refere,
  },
});