// Rocksteady, Mutant Marauder
// Partner with Bebop, Skull & Crossbones (When this creature enters, target player may put Bebop into their hand from
// their library, then shuffle.)
// Trample
// Whenever another nontoken creature you control enters, put a +1/+1 counter on target creature.
import { addCounters, and, defineCard, is, keyword, on, t, tgt, triggered } from '../../motor/api.ts';
import { PARCEIRO_COM, SELECAO } from '../tartarugas.ts';
import { parceiroCom } from '../vampiros.ts';

export default defineCard({
  name: 'Rocksteady, Mutant Marauder',
  faces: [{
    abilities: [
      parceiroCom('Bebop, Skull & Crossbones'),
      keyword('trample'),
      triggered(on.enters(and(is.creature, is.yours, is.nontoken, is.other)), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { targets: [t.creature()], text: 'Sempre que outra criatura que não é ficha que você controla entra, coloque um marcador +1/+1 na criatura alvo.' }),
    ],
  }],
  rulings: {
    1: SELECAO.comecam,
    2: PARCEIRO_COM.busca,
    3: SELECAO.controla,
    4: PARCEIRO_COM.gatilho,
    5: PARCEIRO_COM.gatilho,
    6: SELECAO.identidade,
    7: SELECAO.separados,
    8: PARCEIRO_COM.deck,
    9: PARCEIRO_COM.soEntreSi,
  },
});