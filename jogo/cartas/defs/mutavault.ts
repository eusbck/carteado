// Mutavault
// {T}: Add {C}.
// {1}: This land becomes a 2/2 creature with all creature types until end of turn. It's still a land.
import { activated, allCreatureTypes, defineCard, mana, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Mutavault',
  faces: [{
    abilities: [
      mana('C'),
      activated('{1}', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        // ruling 2: todos os tipos de criatura, mas não ganha o changeling; continua terreno (camada 4)
        untilEndOfTurn(c, [c.source], [{ k: 'addTypes', types: ['Creature'], subtypes: allCreatureTypes() }, { k: 'setPT', p: 2, t: 2 }]);
      }, { text: '{1}: Até o fim do turno, este terreno vira uma criatura 2/2 com todos os tipos de criatura. Continua sendo terreno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 302.6 — o enjoo de invocação olha o controle contínuo desde o início do turno, não há quanto tempo é criatura (motor)',
    2: 'teste: {1}: vira uma criatura 2/2 com todos os tipos de criatura até o fim do turno, sem changeling, e continua terreno',
  },
});
