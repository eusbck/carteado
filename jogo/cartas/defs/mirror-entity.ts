// Mirror Entity
// Changeling (This card is every creature type.)
// {X}: Until end of turn, creatures you control have base power and toughness X/X and gain all creature types.
import { activated, allCreatureTypes, changeling, creaturesOf, defineCard, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Mirror Entity',
  faces: [{
    abilities: [
      changeling(),
      activated('{X}', function* (c) {
        // só as criaturas que você controla na resolução (CR 611.2c); ruling 2: a base X/X passa por cima das bases
        // anteriores (camada 7b), e marcadores e bônus continuam somando por cima
        const ids = creaturesOf(c.g, c.you);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'setPT', p: c.x, t: c.x }, { k: 'addTypes', subtypes: allCreatureTypes() }]);
      }, { text: '{X}: Até o fim do turno, as criaturas que você controla têm força e resistência base X/X e ganham todos os tipos de criatura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.73a — polimorfo vale em todas as zonas (motor/criaturas.ts changeling)',
    2: 'teste: as suas criaturas viram X/X de base, com marcadores somando por cima, e ganham todos os tipos de criatura',
    3: 'teste: com X igual a 0, as suas criaturas viram 0/0 e morrem',
  },
});
